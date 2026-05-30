import { Link, Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HomeIcon, BookOpenIcon, AcademicCapIcon, ClipboardDocumentListIcon,
  CalendarDaysIcon, ChatBubbleLeftRightIcon, BellIcon, UserGroupIcon,
  CurrencyRupeeIcon, VideoCameraIcon, ChartBarIcon, Bars3Icon, XMarkIcon,
  ArrowRightOnRectangleIcon, SunIcon, MoonIcon,
} from "@heroicons/react/24/outline";
import useAuthStore from "../../context/authStore";
import useDarkMode from "../../hooks/useDarkMode";

const SIDEBAR_LINKS = {
  student: [
    { label: "Dashboard", to: "/student/dashboard", icon: HomeIcon },
    { label: "My Courses", to: "/student/courses", icon: BookOpenIcon },
    { label: "Live Classes", to: "/student/live-classes", icon: VideoCameraIcon },
    { label: "Schedule", to: "/student/schedule", icon: CalendarDaysIcon },
    { label: "Quizzes", to: "/student/quizzes", icon: ClipboardDocumentListIcon },
    { label: "Results", to: "/student/results", icon: ChartBarIcon },
    { label: "Attendance", to: "/student/attendance", icon: CalendarDaysIcon },
    { label: "Doubts", to: "/student/doubts", icon: ChatBubbleLeftRightIcon },
    { label: "Notifications", to: "/student/notifications", icon: BellIcon },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher/dashboard", icon: HomeIcon },
    { label: "My Courses", to: "/teacher/courses", icon: BookOpenIcon },
    { label: "Quizzes", to: "/teacher/quizzes", icon: ClipboardDocumentListIcon },
    { label: "Attendance", to: "/teacher/attendance", icon: CalendarDaysIcon },
    { label: "Schedule", to: "/teacher/schedule", icon: VideoCameraIcon },
    { label: "Student Doubts", to: "/teacher/doubts", icon: ChatBubbleLeftRightIcon },
    { label: "Live Classes", to: "/teacher/live-classes", icon: VideoCameraIcon },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: HomeIcon },
    { label: "Users", to: "/admin/users", icon: UserGroupIcon },
    { label: "Courses", to: "/admin/courses", icon: AcademicCapIcon },
    { label: "Payments", to: "/admin/payments", icon: CurrencyRupeeIcon },
    { label: "Notifications", to: "/admin/notifications", icon: BellIcon },
    { label: "Inquiries", to: "/admin/inquiries", icon: ClipboardDocumentListIcon },
    { label: "Attendance", to: "/admin/attendance", icon: CalendarDaysIcon },
  ],
};


export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const links = SIDEBAR_LINKS[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">VS</div>
          <span className="font-heading font-bold text-lg text-gray-900 dark:text-white">VidyaSetu</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1 capitalize">{role} Panel</p>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary-200 flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name ? `${user.name} avatar` : "User avatar"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-primary-700 font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
        <button onClick={toggleDark} className="sidebar-link w-full">
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-white dark:bg-gray-800 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{user?.name?.split(" ")[0]}</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
