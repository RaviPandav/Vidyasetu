import { useEffect, useState } from "react";
import { teacherService } from "../../services";
import toast from "react-hot-toast";
import { getAssetUrl } from "../../utils/urls";
import {
  PlusIcon,
  PencilIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

const CATEGORIES = [
  "Programming",
  "Web Development",
  "Mobile App Development",
  "Data Science",
  "Artificial Intelligence (AI)",
  "Machine Learning",
  "Cyber Security",
  "Cloud Computing",
  "DevOps",
  "Database Management",
  "Software Testing",
  "Game Development",
  "Computer Science",
  "Mathematics",
  "Science",
  "Commerce",
  "Engineering",
  "Digital Marketing",
  "Graphic Design",
  "UI/UX Design",
  "Video Editing",
  "Photography",
  "English Language",
  "Communication Skills",
  "Personality Development",
  "Business & Entrepreneurship",
  "Finance & Accounting",
  "Stock Market & Trading",
  "Competitive Exam Preparation",
  "School Education",
  "Health & Fitness",
  "Music",
  "Cooking",
  "Content Writing",
  "Career Development",
  "Interview Preparation",
  "Freelancing",
  "E-Commerce",
  "Networking",
  "Languages",
  "Python",
  "Java",
  "Data Structures & Algorithms",
  "Full Stack Development",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

function CourseForm({ course, onSave, onClose }) {
  const initialForm = course
    ? {
        title: course.title || "",
        description: course.description || "",
        shortDescription: course.shortDescription || "",
        category: course.category || "Mathematics",
        level: course.level || "All Levels",
        language: course.language || "English",
        price: course.price ?? 0,
        discountPrice: course.discountPrice ?? 0,
        requirements: Array.isArray(course.requirements)
          ? course.requirements.join("\n")
          : course.requirements || "",
        learningOutcomes: Array.isArray(course.learningOutcomes)
          ? course.learningOutcomes.join("\n")
          : course.learningOutcomes || "",
        targetAudience: Array.isArray(course.targetAudience)
          ? course.targetAudience.join("\n")
          : course.targetAudience || "",
      }
    : {
        title: "",
        description: "",
        shortDescription: "",
        category: "Mathematics",
        level: "All Levels",
        language: "English",
        price: 0,
        discountPrice: 0,
        requirements: "",
        learningOutcomes: "",
        targetAudience: "",
      };
  const [form, setForm] = useState(initialForm);
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    course?.thumbnail ? getAssetUrl(course.thumbnail) : "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleThumbnailChange = (file) => {
    setThumbnail(file || null);
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(
      file
        ? URL.createObjectURL(file)
        : course?.thumbnail
          ? getAssetUrl(course.thumbnail)
          : "",
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        requirements:
          typeof form.requirements === "string"
            ? form.requirements.split("\n").filter(Boolean)
            : form.requirements,
        learningOutcomes:
          typeof form.learningOutcomes === "string"
            ? form.learningOutcomes.split("\n").filter(Boolean)
            : form.learningOutcomes,
        targetAudience:
          typeof form.targetAudience === "string"
            ? form.targetAudience.split("\n").filter(Boolean)
            : form.targetAudience,
      };

      const price = Number(payload.price) || 0;
      const discountPrice = Number(payload.discountPrice) || 0;
      if (discountPrice > price) {
        toast.error("Discount price cannot be greater than course price.");
        setLoading(false);
        return;
      }

      payload.price = price;
      payload.discountPrice = discountPrice;

      const requestData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        requestData.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : value,
        );
      });
      if (thumbnail) requestData.append("thumbnail", thumbnail);

      if (course?._id) {
        await teacherService.updateCourse(course._id, requestData);
        toast.success("Course updated!");
      } else {
        await teacherService.createCourse(requestData);
        toast.success("Course created!");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save course");
    }
    setLoading(false);
  };

  const field = (label, key, type = "text", extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {type === "select" ? (
        <select
          className="input-field"
          name={key}
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        >
          {extra.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={key}
          rows={3}
          className="input-field"
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={extra.placeholder}
        />
      ) : (
        <input
          type={type}
          name={key}
          className="input-field"
          value={form[key] ?? ""}
          onChange={(e) =>
            setForm({
              ...form,
              [key]: type === "number" ? +e.target.value : e.target.value,
            })
          }
          placeholder={extra.placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">
            {course ? "Edit Course" : "Create New Course"}
          </h2>
          <button onClick={onClose} className="btn-ghost">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Course Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-40 aspect-video rounded-xl bg-primary-50 border border-gray-200 overflow-hidden flex items-center justify-center text-3xl">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Course preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "📚"
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="w-full text-sm"
                  onChange={(e) => handleThumbnailChange(e.target.files?.[0])}
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or WebP image upload karein.
                </p>
              </div>
            </div>
          </div>
          {field("Course Title *", "title", "text", {
            placeholder: "e.g. Complete Mathematics for Class 12",
          })}
          {field("Short Description", "shortDescription", "textarea", {
            placeholder: "Brief summary (max 300 chars)",
          })}
          {field("Full Description *", "description", "textarea")}
          <div className="grid grid-cols-2 gap-4">
            {field("Category", "category", "select", { options: CATEGORIES })}
            {field("Level", "level", "select", { options: LEVELS })}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("Language", "language", "select", {
              options: ["English", "Gujarati", "Hindi", "Both"],
            })}
            {field("Price (₹)", "price", "number")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("Discount Price (₹)", "discountPrice", "number")}
          </div>
          <p className="text-xs text-gray-500">
            Discount price should be less than or equal to the course price.
          </p>
          {field("Requirements (one per line)", "requirements", "textarea", {
            placeholder: "Basic mathematics knowledge\nAccess to internet",
          })}
          {field(
            "Learning Outcomes (one per line)",
            "learningOutcomes",
            "textarea",
            { placeholder: "Understand calculus\nSolve integration problems" },
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Saving..." : "Save Course"}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LectureModal({ course, onClose, onSaved }) {
  const [sectionId, setSectionId] = useState(course.sections?.[0]?._id || "");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [form, setForm] = useState({ title: "", description: "", video: null });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a lecture title.");
      return;
    }
    if (!sectionId && !newSectionTitle.trim()) {
      toast.error("Please choose an existing section or create a new one.");
      return;
    }
    setLoading(true);
    setUploadProgress(0);
    try {
      let targetSectionId = sectionId;
      if (!targetSectionId) {
        const sectionRes = await teacherService.addSection(course._id, {
          title: newSectionTitle,
        });
        targetSectionId = sectionRes.data.course.sections.slice(-1)[0]._id;
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);

      if (form.video) {
        formData.append("video", form.video);
      }

      await teacherService.addLecture(course._id, targetSectionId, formData);
      toast.success("Video lecture added to course successfully.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to add lecture video.",
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Add Video Lecture</h2>
          <button onClick={onClose} className="btn-ghost">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Course
            </label>
            <p className="text-sm font-semibold text-gray-900">
              {course.title}
            </p>
          </div>

          {course.sections?.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Section
              </label>
              <select
                className="input-field"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
              >
                <option value="">Create new section</option>
                {course.sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Section Title
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Introduction"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lecture Title *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Introduction to React"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="Lecture summary or notes"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Video File
            </label>
            <input
              type="file"
              accept="video/*"
              className="w-full"
              onChange={(e) => setForm({ ...form, video: e.target.files[0] })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a video file to attach to this lecture.
            </p>
            {uploadProgress > 0 && uploadProgress < 100 ? (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Uploading video: {uploadProgress}%
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Saving..." : "Add Video"}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [lectureCourse, setLectureCourse] = useState(null);

  const fetchCourses = () => {
    teacherService
      .getCourses()
      .then((res) => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handlePublish = async (id) => {
    try {
      const res = await teacherService.publishCourse(id);
      toast.success(
        res.data.isPublished ? "Course published!" : "Course unpublished",
      );
      fetchCourses();
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 skeleton rounded-2xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {(showForm || editCourse) && (
        <CourseForm
          course={editCourse}
          onSave={() => {
            setShowForm(false);
            setEditCourse(null);
            fetchCourses();
          }}
          onClose={() => {
            setShowForm(false);
            setEditCourse(null);
          }}
        />
      )}
      {showLectureModal && lectureCourse && (
        <LectureModal
          course={lectureCourse}
          onSaved={() => fetchCourses()}
          onClose={() => {
            setShowLectureModal(false);
            setLectureCourse(null);
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          My Courses
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-sm"
        >
          <PlusIcon className="w-4 h-4" /> Create Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-gray-500 mb-4">
            No courses yet. Create your first course!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex"
          >
            <PlusIcon className="w-4 h-4" /> Create Course
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course._id} className="card flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={getAssetUrl(course.thumbnail)}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "📚"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-gray-900 truncate">
                  {course.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="badge-primary text-xs">
                    {course.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {course.enrollmentCount || 0} students
                  </span>
                  <span className="text-xs text-gray-500">₹{course.price}</span>
                  {course.isApproved ? (
                    <span className="badge-success text-xs">Approved</span>
                  ) : (
                    <span className="badge-warning text-xs">
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setLectureCourse(course);
                    setShowLectureModal(true);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <VideoCameraIcon className="w-4 h-4 inline-block mr-1" /> Add
                  Video
                </button>
                <button
                  onClick={() => handlePublish(course._id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    course.isPublished
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {course.isPublished ? "Published" : "Publish"}
                </button>
                <button
                  onClick={() => setEditCourse(course)}
                  className="btn-ghost p-2"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
