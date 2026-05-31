import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { publicService } from "../../services";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const LEVELS = ["", "Beginner", "Intermediate", "Advanced", "All Levels"];

const getAssetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_ORIGIN}${normalized}`;
};

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: (idx) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: idx * 0.04 },
  }),
};

function CourseCard({ course, index }) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="show">
      <Link
        to={`/courses/${course.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card-hover dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="relative h-44 overflow-hidden bg-primary-50">
          {course.thumbnail ? (
            <img
              src={getAssetUrl(course.thumbnail)}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
              <AcademicCapIcon className="h-16 w-16 text-primary-500" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
            {course.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="badge-primary text-xs">{course.level}</span>
            <span className="text-xs text-gray-400">{course.language}</span>
          </div>
          <h3 className="mb-1 line-clamp-2 font-heading font-bold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-white">
            {course.title}
          </h3>
          <p className="mb-3 text-sm text-gray-500">by {course.teacher?.name || "Instructor"}</p>
          {course.shortDescription && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">{course.shortDescription}</p>
          )}

          <div className="mb-4 mt-auto flex items-center gap-1">
            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {course.rating?.average?.toFixed(1) || "New"}
            </span>
            {course.rating?.count > 0 && <span className="text-xs text-gray-400">({course.rating.count})</span>}
            <span className="ml-auto text-xs text-gray-400">{course.enrollmentCount || 0} students</span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
            {course.discountPrice > 0 ? (
              <div>
                <span className="font-heading text-lg font-bold text-primary-600">Rs {course.discountPrice}</span>
                <span className="ml-2 text-sm text-gray-400 line-through">Rs {course.price}</span>
              </div>
            ) : (
              <span className="font-heading text-lg font-bold text-primary-600">
                {course.price === 0 ? "Free" : `Rs ${course.price}`}
              </span>
            )}
            <ArrowRightIcon className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    publicService
      .getCourses({ search, level, sort, page, limit: 12 })
      .then((res) => {
        setCourses(res.data.courses || []);
        setPagination(res.data.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, level, sort, page]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="hero-grid bg-white py-14 dark:bg-gray-950">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="badge-primary mb-4">Course Library</span>
            <h1 className="section-heading mb-3 dark:text-white">Browse Courses</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Search skill-focused courses, compare levels, and start learning with expert teachers.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="page-container py-10">
        <div className="-mt-16 mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-card dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search courses by title, topic, or category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="input-field sm:w-44"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Levels</option>
              {LEVELS.filter(Boolean).map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <select className="input-field sm:w-48" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <p className="mb-6 text-sm font-medium text-gray-500">{pagination.total || 0} courses found</p>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-96 skeleton rounded-2xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-800">
            <MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 font-heading text-xl font-bold text-gray-700 dark:text-white">No courses found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course, idx) => (
              <CourseCard key={course._id} course={course} index={idx} />
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-ghost px-4 py-2 disabled:opacity-40">
              Prev
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">Page {page} of {pagination.pages}</span>
            <button disabled={page === pagination.pages} onClick={() => setPage(page + 1)} className="btn-ghost px-4 py-2 disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
