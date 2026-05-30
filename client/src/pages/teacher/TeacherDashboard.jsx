import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teacherService } from "../../services";
import { BookOpenIcon, UserGroupIcon, ChatBubbleLeftRightIcon, StarIcon } from "@heroicons/react/24/outline";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <div className="text-2xl font-heading font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherService.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 skeleton" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton" />)}</div>
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your courses, students and content</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpenIcon} label="My Courses" value={stats.totalCourses || 0} color="bg-primary-500" />
        <StatCard icon={UserGroupIcon} label="Total Students" value={stats.totalStudents || 0} color="bg-success-500" />
        <StatCard icon={ChatBubbleLeftRightIcon} label="Open Doubts" value={stats.openDoubts || 0} color="bg-warning-500" />
        <StatCard icon={StarIcon} label="Avg Rating" value={stats.avgRating || "—"} color="bg-accent-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-lg text-gray-900">My Courses</h2>
            <Link to="/teacher/courses" className="text-sm text-primary-600 hover:underline">Manage</Link>
          </div>
          {(data?.courses || []).length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No courses yet. <Link to="/teacher/courses" className="text-primary-600 hover:underline">Create one</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.courses || []).map((course) => (
                <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.enrollmentCount || 0} students</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {course.isPublished
                      ? <span className="badge-success text-xs">Live</span>
                      : <span className="badge-warning text-xs">Draft</span>
                    }
                    <span className="text-xs text-yellow-500">⭐ {course.rating?.average?.toFixed(1) || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Results */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-lg text-gray-900">Quiz Overview</h2>
            <Link to="/teacher/quizzes" className="text-sm text-primary-600 hover:underline">Manage</Link>
          </div>
          {(data?.quizzes || []).length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No quizzes created yet.</div>
          ) : (
            <div className="space-y-3">
              {(data?.quizzes || []).map((quiz) => (
                <div key={quiz._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900 truncate flex-1">{quiz.title}</p>
                  <span className="text-sm text-gray-500 flex-shrink-0 ml-3">{quiz.attempts?.length || 0} attempts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
