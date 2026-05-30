const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const {
  getStudentDashboard,
  getStudentLiveClasses,
} = require("../../controllers/student/studentDashboardController");
const {
  enrollCourse,
  getEnrolledCourses,
  getCourseContent,
  updateLectureProgress,
} = require("../../controllers/student/studentCourseController");
const {
  getAvailableQuizzes,
  submitQuiz,
  getMyResults,
} = require("../../controllers/student/studentQuizController");
const {
  getMyAttendance,
  markVideoAttendance,
  markLiveJoinAttendance,
} = require("../../controllers/student/studentAttendanceController");
const { getMySchedule } = require("../../controllers/student/studentScheduleController");
const {
  createDoubt,
  getMyDoubts,
  upvoteDoubt,
} = require("../../controllers/student/studentDoubtController");
const {
  createPaymentOrder,
  verifyPayment,
} = require("../../controllers/student/studentPaymentController");
const {
  getMyNotifications,
  markNotificationRead,
} = require("../../controllers/student/studentNotificationController");

router.use(protect, authorize("student", "admin"));

// Dashboard
router.get("/dashboard", getStudentDashboard);
router.get("/live-classes", getStudentLiveClasses);
router.get("/schedule", getMySchedule);
router.post("/schedule/:scheduleId/join", markLiveJoinAttendance);

// Courses
router.get("/courses", getEnrolledCourses);
router.get("/courses/:id/content", getCourseContent);
router.patch("/courses/:id/progress", updateLectureProgress);

// Enrollment & Payment
router.post("/enroll/:courseId", enrollCourse);
router.post("/payment/create-order", createPaymentOrder);
router.post("/payment/verify", verifyPayment);

// Quizzes
router.get("/quizzes", getAvailableQuizzes);
router.post("/quizzes/:id/submit", submitQuiz);
router.get("/results", getMyResults);

// Attendance
router.get("/attendance", getMyAttendance);
router.post("/attendance/video-progress", markVideoAttendance);

// Doubts
router.get("/doubts", getMyDoubts);
router.post("/doubts", createDoubt);
router.patch("/doubts/:id/upvote", upvoteDoubt);

// Notifications
router.get("/notifications", getMyNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

module.exports = router;
