import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./context/authStore";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Public Pages
import HomePage from "./pages/public/HomePage";
import CoursesPage from "./pages/public/CoursesPage";
import CourseDetailPage from "./pages/public/CourseDetailPage";
import TeachersPage from "./pages/public/TeachersPage";
import ContactPage from "./pages/public/ContactPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentVideoPlayer from "./pages/student/StudentVideoPlayer";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentResults from "./pages/student/StudentResults";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentDoubts from "./pages/student/StudentDoubts";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentLiveClasses from "./pages/student/StudentLiveClasses";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import TeacherQuizzes from "./pages/teacher/TeacherQuizzes";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherSchedule from "./pages/teacher/TeacherSchedule";
import TeacherDoubts from "./pages/teacher/TeacherDoubts";
import TeacherLiveClasses from "./pages/teacher/TeacherLiveClasses";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminInquiries from "./pages/admin/AdminInquiries";


// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: "DM Sans, sans-serif", borderRadius: "12px" },
          success: { iconTheme: { primary: "#6C63FF", secondary: "#fff" } },
        }}
      />
      <Routes>
        {/* ── Public Routes ──────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ── Auth Routes ────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* ── Student Routes ─────────────────────────── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:id/watch" element={<StudentVideoPlayer />} />
          <Route path="live-classes" element={<StudentLiveClasses />} />
          <Route path="quizzes" element={<StudentQuizzes />} />
          <Route path="results" element={<StudentResults />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="doubts" element={<StudentDoubts />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>

        {/* ── Teacher Routes ─────────────────────────── */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <DashboardLayout role="teacher" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="quizzes" element={<TeacherQuizzes />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="schedule" element={<TeacherSchedule />} />
          <Route path="doubts" element={<TeacherDoubts />} />
          <Route path="live-classes" element={<TeacherLiveClasses />} />
        </Route>

        {/* ── Admin Routes ───────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="attendance" element={<AdminAttendance />} />

        </Route>

        {/* ── Fallback ───────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
