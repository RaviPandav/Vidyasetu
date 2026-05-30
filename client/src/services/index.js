import api from "./api";

const multipartConfig = {};

// ── Auth ──────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get("/auth/me"),
};

// ── Public ────────────────────────────────────────────────
export const publicService = {
  getCourses: (params) => api.get("/public/courses", { params }),
  getCourse: (slug) => api.get(`/public/courses/${slug}`),
  getTeachers: () => api.get("/public/teachers"),
  submitInquiry: (data) => api.post("/public/inquiry", data),
};

// ── Student ───────────────────────────────────────────────
export const studentService = {
  getDashboard: () => api.get("/student/dashboard"),
  getLiveClasses: () => api.get("/student/live-classes"),
  getSchedule: (params) => api.get("/student/schedule", { params }),
  joinScheduledLecture: (id) => api.post(`/student/schedule/${id}/join`),
  getEnrolledCourses: () => api.get("/student/courses"),
  getCourseContent: (id) => api.get(`/student/courses/${id}/content`),
  updateProgress: (id, progress) => api.patch(`/student/courses/${id}/progress`, { progress }),
  enroll: (courseId) => api.post(`/student/enroll/${courseId}`),
  createPaymentOrder: (courseId) => api.post("/student/payment/create-order", { courseId }),
  verifyPayment: (data) => api.post("/student/payment/verify", data),
  getQuizzes: () => api.get("/student/quizzes"),
  submitQuiz: (id, data) => api.post(`/student/quizzes/${id}/submit`, data),
  getResults: () => api.get("/student/results"),
  getAttendance: () => api.get("/student/attendance"),
  markVideoAttendance: (data) => api.post("/student/attendance/video-progress", data),
  getDoubts: () => api.get("/student/doubts"),
  createDoubt: (data) => api.post("/student/doubts", data),
  upvoteDoubt: (id) => api.patch(`/student/doubts/${id}/upvote`),
  getNotifications: () => api.get("/student/notifications"),
  markNotificationRead: (id) => api.patch(`/student/notifications/${id}/read`),
};

// ── Teacher ───────────────────────────────────────────────
export const teacherService = {
  getDashboard: () => api.get("/teacher/dashboard"),
  getCourses: () => api.get("/teacher/courses"),
  getCourseStudents: (id) => api.get(`/teacher/courses/${id}/students`),
  createCourse: (data) => api.post("/teacher/courses", data, data instanceof FormData ? multipartConfig : undefined),
  updateCourse: (id, data) => api.put(`/teacher/courses/${id}`, data, data instanceof FormData ? multipartConfig : undefined),
  publishCourse: (id) => api.post(`/teacher/courses/${id}/publish`),
  addSection: (id, data) => api.post(`/teacher/courses/${id}/sections`, data),
  addLecture: (id, sectionId, formData) =>
    api.post(`/teacher/courses/${id}/sections/${sectionId}/lectures`, formData, multipartConfig),
  updateLecture: (courseId, lectureId, formData) =>
    api.patch(`/teacher/courses/${courseId}/lectures/${lectureId}`, formData, multipartConfig),
  deleteLecture: (courseId, lectureId) =>
    api.delete(`/teacher/courses/${courseId}/lectures/${lectureId}`),
  getQuizzes: () => api.get("/teacher/quizzes"),
  createQuiz: (data) => api.post("/teacher/quizzes", data),
  updateQuiz: (id, data) => api.put(`/teacher/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/teacher/quizzes/${id}`),
  getQuizResults: (id) => api.get(`/teacher/quizzes/${id}/results`),
  markAttendance: (data) => api.post("/teacher/attendance", data),
  getAttendance: (params) => api.get("/teacher/attendance", { params }),
  getAttendanceAnalytics: (params) => api.get("/teacher/attendance/analytics", { params }),
  exportAttendance: (params) => api.get("/teacher/attendance/export", { params, responseType: "blob" }),
  getSchedule: (params) => api.get("/teacher/schedule", { params }),
  createSchedule: (data) => api.post("/teacher/schedule", data),
  updateSchedule: (id, data) => api.put(`/teacher/schedule/${id}`, data),
  cancelSchedule: (id) => api.delete(`/teacher/schedule/${id}`),
  getDoubts: (params) => api.get("/teacher/doubts", { params }),
  answerDoubt: (id, content) => api.post(`/teacher/doubts/${id}/answer`, { content }),
  getLiveClasses: () => api.get("/teacher/live-classes"),
  scheduleLiveClass: (data) => api.post("/teacher/live-classes", data),
  updateLiveClass: (id, data) => api.put(`/teacher/live-classes/${id}`, data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminService = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  getCourses: (params) => api.get("/admin/courses", { params }),
  approveCourse: (id) => api.patch(`/admin/courses/${id}/approve`),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getPayments: (params) => api.get("/admin/payments", { params }),
  getPaymentStats: () => api.get("/admin/payments/stats"),
  sendNotification: (data) => api.post("/admin/notifications/send", data),
  getAttendanceAnalytics: (params) => api.get("/admin/attendance/analytics", { params }),
  getInquiries: (params) => api.get("/admin/inquiries", { params }),
};

