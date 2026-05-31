import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  VideoCameraIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const stats = [
  { label: "Students Enrolled", value: "10,000+" },
  { label: "Expert Teachers", value: "150+" },
  { label: "Courses Available", value: "500+" },
  { label: "Success Rate", value: "95%" },
];

const features = [
  {
    icon: VideoCameraIcon,
    title: "Live & Recorded Classes",
    desc: "Watch HD video lectures anytime. Join live sessions with your teacher in real-time.",
  },
  {
    icon: ClipboardDocumentListIcon,
    title: "Online Tests & Quizzes",
    desc: "Take timed tests, get instant results, and track your performance with detailed analytics.",
  },
  {
    icon: AcademicCapIcon,
    title: "Expert Faculty",
    desc: "Learn from experienced teachers with proven track records across all subjects.",
  },
  {
    icon: UserGroupIcon,
    title: "Doubt Support",
    desc: "Get your doubts answered within hours by teachers and peers. Never get stuck again.",
  },
];

const testimonials = [
  {
    name: "Priya Shah",
    grade: "Class 12 - Science",
    text: "VidyaSetu helped me score 95% in my board exams. The video lectures are crystal clear and the mock tests are exactly like the real exam.",
    avatar: "P",
  },
  {
    name: "Raj Patel",
    grade: "JEE Aspirant",
    text: "Best coaching platform in Gujarat. The teachers are incredibly knowledgeable and always available to clear doubts.",
    avatar: "R",
  },
  {
    name: "Meera Desai",
    grade: "Class 10 Student",
    text: "I love the attendance tracking and the quiz system. My parents can also see my progress which motivates me to study harder.",
    avatar: "M",
  },
];

const categories = [
  "Data Science",
  "Artificial Intelligence (AI)",
  "Web Development",
  "Full Stack Development",
  "Python",
  "Java",
  "Data Structures & Algorithms",
  "Cloud Computing",
  "Cyber Security",
  "Machine Learning",
  "DevOps",
  "Database Management",
  "Software Testing",
  "Mobile App Development",
  "UI/UX Design",
  "Digital Marketing",
  "Graphic Design",
  "Video Editing",
  "Mathematics",
  "Science",
  "Commerce",
  "English Language",
  "Communication Skills",
  "Competitive Exam Preparation",
];

const previewItems = [
  { label: "Live Class", value: "Physics - 7:30 PM", icon: VideoCameraIcon, progress: 82 },
  { label: "Quiz Score", value: "92% completed", icon: ClipboardDocumentListIcon, progress: 92 },
  { label: "Mentor Reply", value: "Doubt answered", icon: AcademicCapIcon, progress: 88 },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function HomePage() {
  return (
    <div>
      <section className="hero-grid relative overflow-hidden bg-white py-20 dark:bg-gray-950 md:py-28">
        <div className="page-container relative">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              {...fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm dark:border-primary-900 dark:bg-gray-900 dark:text-primary-300"
            >
              Gujarat's trusted online coaching platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 font-heading text-4xl font-bold leading-tight text-gray-950 dark:text-white md:text-6xl"
            >
              Your Bridge to
              <span className="gradient-text block">Academic Excellence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl"
            >
              Join thousands of students across Gujarat learning with expert teachers,
              live classes, and comprehensive study material in one focused platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link to="/register" className="btn-primary px-8 py-3 text-base">
                Start Learning Free <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/courses" className="btn-secondary px-8 py-3 text-base">
                Explore Courses
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500"
            >
              {["No credit card required", "Free courses available", "Gujarati & English"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="h-4 w-4 text-success-500" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="hero-preview mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-primary-500/10 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Student Dashboard</p>
                <h3 className="font-heading text-lg font-bold text-gray-950 dark:text-white">Today's learning plan</h3>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Live
              </span>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-3">
              {previewItems.map(({ label, value, icon: Icon, progress }, idx) => (
                <motion.div
                  key={label}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-left dark:border-gray-800 dark:bg-gray-950"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: idx * 0.35, ease: "easeInOut" }}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-950 dark:text-white">{label}</p>
                  <p className="mt-1 text-sm text-gray-500">{value}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${progress}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-primary-600 py-12">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <div className="mb-1 font-heading text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-primary-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="page-container">
          <div className="mb-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="section-heading mb-3 dark:text-white"
            >
              Explore by Subject
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Find courses across all major subjects and competitive exams
            </motion.p>

            <div className="subject-marquee mx-auto mt-8 max-w-6xl overflow-hidden">
              <div className="subject-marquee-track flex w-max gap-3">
                {[...categories, ...categories].map((cat, i) => (
                  <Link
                    key={`${cat}-${i}`}
                    to={`/courses?category=${encodeURIComponent(cat)}`}
                    className="inline-flex h-11 shrink-0 items-center rounded-full border-2 border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-primary-900/20"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="page-container">
          <div className="mb-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="section-heading mb-3 dark:text-white"
            >
              Everything You Need to Succeed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400"
            >
              VidyaSetu brings together all the tools modern students and teachers need in one powerful platform.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                whileHover={{ y: -6 }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: idx * 0.04 }}
                className="card group text-center transition-all duration-200 hover:border-primary-200 hover:shadow-card-hover"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 transition-colors group-hover:bg-primary-500 dark:bg-primary-900/30">
                  <Icon className="h-7 w-7 text-primary-600 transition-colors group-hover:text-white" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 dark:bg-gray-900">
        <div className="page-container">
          <div className="mb-14 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="section-heading mb-3 dark:text-white"
            >
              Students Love VidyaSetu
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Real success stories from real students
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                className="card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: idx * 0.06 }}
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-sm italic leading-relaxed text-gray-600 dark:text-gray-400">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.grade}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-700 py-20">
        <div className="page-container text-center">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="mb-4 font-heading text-3xl font-bold text-white md:text-4xl"
          >
            Ready to Start Your Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8 text-lg text-primary-100"
          >
            Join 10,000+ students already learning on VidyaSetu
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-primary-600 transition-all hover:bg-primary-50"
            >
              Create Free Account <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white px-8 py-3 font-bold text-white transition-all hover:bg-white/10"
            >
              Browse Courses
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
