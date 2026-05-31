import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services";
import { getAssetUrl } from "../../utils/urls";
import { BookOpenIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@heroicons/react/24/outline";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getEnrolledCourses()
      .then((res) => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""} enrolled</p>
        </div>
        <Link to="/courses" className="btn-secondary inline-flex items-center justify-center gap-2">
          <MagnifyingGlassIcon className="w-4 h-4" />
          Browse Courses
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-20">
          <BookOpenIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="font-heading text-xl font-bold text-gray-700 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Browse our catalog and enroll in a course to get started.</p>
          <Link to="/courses" className="btn-primary inline-flex">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((enrollment, i) => {
            const course = enrollment.course;
            if (!course) return null;
            const progress = enrollment.progress || 0;
            return (
              <div key={i} className="card-hover flex flex-col">
                <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                  {course.thumbnail ? (
                    <img src={getAssetUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-4xl">
                      📚
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span className="badge-primary text-xs mb-2 inline-block">{course.category}</span>
                  <h3 className="font-heading font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    by {course.teacher?.name || "Instructor"}
                  </p>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Link
                  to={`/student/courses/${course._id}/watch`}
                  className="btn-primary w-full text-sm justify-center"
                >
                  <PlayCircleIcon className="w-4 h-4" />
                  {progress > 0 ? "Continue Learning" : "Start Learning"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
