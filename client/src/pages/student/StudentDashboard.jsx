import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services";
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div className={`card flex items-center gap-4 transform transition-all duration-300 ease-out hover:shadow-lg hover:scale-105 hover:-translate-y-2 animate-bounce-in ${delay}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color} transition-transform duration-300 group-hover:rotate-12`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div className="flex-1">
      <div className="text-2xl font-heading font-bold text-gray-900 transition-colors duration-300">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 skeleton" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton" />)}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const courses = data?.enrolledCourses?.slice(0, 4) || [];
  const upcomingClasses = data?.upcomingClasses || [];
  const todaysLectures = data?.todaysLectures || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-2 animate-slide-in">
        <h1 className="font-heading text-2xl font-bold text-gray-900">
          Good morning, {data?.student?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your learning overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpenIcon} label="Enrolled Courses" value={stats.enrolledCourses || 0} color="bg-primary-500" delay="delay-1" />
        <StatCard icon={ChartBarIcon} label="Overall Progress" value={`${stats.overallProgress || 0}%`} color="bg-success-500" delay="delay-2" />
        <StatCard icon={AcademicCapIcon} label="Completed" value={stats.completedCourses || 0} color="bg-warning-500" delay="delay-3" />
        <StatCard icon={ClipboardDocumentCheckIcon} label="Quizzes Taken" value={stats.quizzesTaken || 0} color="bg-accent-500" delay="delay-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-lg text-gray-900">My Courses</h2>
            <Link to="/student/courses" className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200">View all</Link>
          </div>
          {courses.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BookOpenIcon className="w-10 h-10 mx-auto mb-3 animate-float" />
              <p>No courses yet. <Link to="/courses" className="text-primary-600 hover:underline">Browse courses</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((enrollment, i) => {
                const course = enrollment.course;
                if (!course) return null;

                return (
                  <Link
                    key={i}
                    to={`/student/courses/${course._id}/watch`}
                    className={`flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 shadow-sm hover:shadow-lg group animate-fade-in-up delay-${i + 1}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 text-2xl group-hover:rotate-12 transition-transform duration-300">
                      {String.fromCodePoint(0x1F4DA)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors duration-300">{course.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-400 to-primary-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{enrollment.progress || 0}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card animate-scale-in delay-1">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-5">Today's Lectures</h2>
          {todaysLectures.length === 0 && upcomingClasses.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No upcoming classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysLectures.map((cls, i) => (
                <div key={cls._id || i} className={`p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 transition-all duration-300 hover:shadow-md hover:scale-105 transform animate-fade-in-up delay-${i + 2}`}>
                  <p className="font-semibold text-gray-900 text-sm">{cls.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{cls.course?.title}</p>
                  <p className="text-xs text-primary-700 font-medium mt-2">
                    Lecture time: {new Date(cls.scheduledAt).toLocaleString("en-IN")}
                  </p>
                  <Link to="/student/schedule" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-primary-700 active:scale-95">
                    <VideoCameraIcon className="w-4 h-4" />
                    Open Schedule
                  </Link>
                </div>
              ))}
              {upcomingClasses.map((cls, i) => (
                <div key={i} className={`p-3 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-accent-200 transition-all duration-300 hover:shadow-md hover:scale-105 transform animate-fade-in-up delay-${i + 3}`}>
                  <p className="font-semibold text-gray-900 text-sm">{cls.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{cls.course?.title}</p>
                  <p className="text-xs text-accent-700 font-medium mt-2">
                    Class time: {new Date(cls.scheduledAt).toLocaleString("en-IN")}
                  </p>
                  {cls.meetingLink ? (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-accent-700 active:scale-95"
                    >
                      <VideoCameraIcon className="w-4 h-4" />
                      Join Class
                    </a>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400">Join link will be available soon</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
