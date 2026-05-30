import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { publicService } from "../../services";
import { MagnifyingGlassIcon, StarIcon } from "@heroicons/react/24/outline";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");
const getAssetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_ORIGIN}${normalized}`;
};

const LEVELS = ["", "Beginner", "Intermediate", "Advanced", "All Levels"];

function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="card-hover flex flex-col group"
    >
      <div className="w-full h-44 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl mb-4 flex items-center justify-center text-5xl overflow-hidden">
        {course.thumbnail ? (
          <img
            src={getAssetUrl(course.thumbnail)}
            alt={course.title}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          "📚"
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-primary text-xs">{course.category}</span>
          <span className="text-xs text-gray-400">{course.level}</span>
        </div>
        <h3 className="font-heading font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          by {course.teacher?.name || "Instructor"}
        </p>
        {course.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {course.shortDescription}
          </p>
        )}
        <div className="flex items-center gap-1 mb-3">
          <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-gray-700">
            {course.rating?.average?.toFixed(1) || "New"}
          </span>
          {course.rating?.count > 0 && (
            <span className="text-xs text-gray-400">
              ({course.rating.count})
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {course.enrollmentCount || 0} students
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        {course.discountPrice > 0 ? (
          <div>
            <span className="font-heading font-bold text-lg text-primary-600">
              ₹{course.discountPrice}
            </span>
            <span className="text-sm text-gray-400 line-through ml-2">
              ₹{course.price}
            </span>
          </div>
        ) : (
          <span className="font-heading font-bold text-lg text-primary-600">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </span>
        )}
        <span className="text-xs badge-primary">{course.language}</span>
      </div>
    </Link>
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
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="section-heading mb-2">Browse Courses</h1>
        <p className="text-gray-600">
          Find the perfect course for your learning journey
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
          className="input-field sm:w-40"
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
        <select
          className="input-field sm:w-40"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-6">
        {pagination.total || 0} courses found
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-80 skeleton rounded-2xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-heading text-xl font-bold text-gray-700 mb-2">
            No courses found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="btn-ghost px-4 py-2 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(page + 1)}
            className="btn-ghost px-4 py-2 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
