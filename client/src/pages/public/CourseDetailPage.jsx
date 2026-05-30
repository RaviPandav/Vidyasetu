// CourseDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicService, studentService } from "../../services";
import useAuthStore from "../../context/authStore";
import { StarIcon, ClockIcon, BookOpenIcon, UserGroupIcon, LanguageIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    publicService.getCourse(slug)
      .then((res) => setCourse(res.data.course))
      .catch(() => navigate("/courses"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (user?.role !== "student") { toast.error("Only students can enroll"); return; }

    try {
      setPaymentLoading(true);
      const payableAmount = course.discountPrice > 0 ? course.discountPrice : course.price;

      if (payableAmount <= 0) {
        const res = await studentService.enroll(course._id);
        toast.success(res.data.message || "Enrolled successfully!");
        navigate("/student/courses");
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Unable to load payment checkout. Please try again.");
        return;
      }

      const { data } = await studentService.createPaymentOrder(course._id);
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "VidyaSetu",
        description: data.courseName,
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#6C63FF" },
        handler: async (response) => {
          try {
            await studentService.verifyPayment({ ...response, courseId: course._id });
            toast.success("Payment successful! You are enrolled.");
            navigate("/student/courses");
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment verification failed.");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        const description = response?.error?.description || response?.error?.reason;
        toast.error(description || "Payment failed. Please try again.");
        setPaymentLoading(false);
      });
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to start payment.");
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="page-container py-10 animate-pulse"><div className="h-96 skeleton rounded-2xl" /></div>;
  if (!course) return null;

  const totalLectures = course.sections?.reduce((a, s) => a + s.lectures.length, 0) || 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-14">
        <div className="page-container">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-primary text-sm">{course.category}</span>
              <span className="text-gray-400 text-sm">{course.level}</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-gray-300 text-lg mb-5">{course.shortDescription}</p>
            <div className="flex flex-wrap items-center gap-5 text-sm">
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{course.rating?.average?.toFixed(1) || "New"}</span>
                <span className="text-gray-400">({course.rating?.count || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <UserGroupIcon className="w-4 h-4" />{course.enrollmentCount || 0} students
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <BookOpenIcon className="w-4 h-4" />{totalLectures} lectures
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <LanguageIcon className="w-4 h-4" />{course.language}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                {course.teacher?.name?.[0]}
              </div>
              <div>
                <p className="font-medium">Instructor: {course.teacher?.name}</p>
                <p className="text-gray-400 text-sm">{course.teacher?.bio?.slice(0, 80)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="font-heading text-xl font-bold mb-3">About This Course</h2>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            {/* Learning Outcomes */}
            {course.learningOutcomes?.length > 0 && (
              <div className="card">
                <h2 className="font-heading text-xl font-bold mb-4">What You'll Learn</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {course.learningOutcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>{o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            {course.sections?.length > 0 && (
              <div className="card">
                <h2 className="font-heading text-xl font-bold mb-4">Course Curriculum</h2>
                <div className="space-y-2">
                  {course.sections.map((section, si) => (
                    <div key={section._id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenSection(openSection === si ? -1 : si)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="font-semibold text-gray-800">{section.title}</span>
                        <span className="text-sm text-gray-500">{section.lectures.length} lectures</span>
                      </button>
                      {openSection === si && (
                        <div className="divide-y divide-gray-50">
                          {section.lectures.map((lecture) => (
                            <div key={lecture._id} className="flex items-center gap-3 p-3 px-4">
                              <span className="text-gray-400 text-sm">▶</span>
                              <span className="flex-1 text-sm text-gray-700">{lecture.title}</span>
                              {lecture.isFree && <span className="badge-success text-xs">Free</span>}
                              {lecture.duration && <span className="text-xs text-gray-400">{Math.floor(lecture.duration / 60)}m</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Enroll Card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 shadow-card-hover">
              <div className="mb-4">
                {course.discountPrice > 0 ? (
                  <div>
                    <span className="font-heading font-bold text-3xl text-primary-600">₹{course.discountPrice}</span>
                    <span className="text-lg text-gray-400 line-through ml-3">₹{course.price}</span>
                    <span className="badge-success ml-2">{Math.round(((course.price - course.discountPrice) / course.price) * 100)}% off</span>
                  </div>
                ) : (
                  <span className="font-heading font-bold text-3xl text-primary-600">{course.price === 0 ? "Free" : `₹${course.price}`}</span>
                )}
              </div>
              <button onClick={handleEnroll} disabled={paymentLoading} className="btn-primary w-full py-3 text-base mb-4">
                {paymentLoading ? "Processing..." : isAuthenticated ? "Enroll Now" : "Login to Enroll"}
              </button>
              <p className="text-center text-xs text-gray-400 mb-4">30-day money-back guarantee</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ {totalLectures} video lectures</li>
                <li>✅ Downloadable resources</li>
                <li>✅ Certificate of completion</li>
                <li>✅ Doubt support</li>
                <li>✅ Lifetime access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
