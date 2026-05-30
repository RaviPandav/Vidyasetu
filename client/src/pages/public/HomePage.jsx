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
  "Cloud Computing",
  "Cyber Security",
  "Machine Learning",
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function HomePage() {
  return (
    <div>
      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20 md:py-32">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="page-container relative">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ filter: ["blur(0px)", "blur(0px)"] }}
            className="absolute inset-x-0 top-0 -z-10 pointer-events-none"
          >
            <motion.div
              aria-hidden
              className="absolute right-1/4 top-10 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl"
              animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              {...fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-6"
            >
              🎓 Gujarat's #1 Online Coaching Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
            >
              Your Bridge to
              <span className="gradient-text block">Academic Excellence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed"
            >
              Join thousands of students across Gujarat learning with expert teachers,
              live classes, and comprehensive study material — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register" className="btn-primary text-base px-8 py-3">
                Start Learning Free <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link to="/courses" className="btn-secondary text-base px-8 py-3">
                Explore Courses
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500"
            >
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              No credit card required
              <span className="mx-2">·</span>
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              Free courses available
              <span className="mx-2">·</span>
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              Gujarati & English
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="py-12 bg-primary-500">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <div className="font-heading text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-primary-200 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="page-container">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="section-heading mb-3"
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

            {/* Subject buttons: left-to-right slide-in animation + display */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: 0 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: "linear" }}
                  className="origin-center"
                >
                  <Link
                    to={`/courses?category=${encodeURIComponent(cat)}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                  >
                    <span className="leading-none">{cat}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="page-container">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="section-heading mb-3"
            >
              Everything You Need to Succeed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              VidyaSetu brings together all the tools modern students and teachers need in one powerful platform.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: idx * 0.04 }}
                className="card text-center"
              >
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="page-container">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="section-heading mb-3"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.name}
                className="card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: idx * 0.06 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-500">{t.grade}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="page-container text-center">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to Start Your Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-primary-200 mb-8 text-lg"
          >
            Join 10,000+ students already learning on VidyaSetu
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-all"
            >
              Create Free Account <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Browse Courses
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

