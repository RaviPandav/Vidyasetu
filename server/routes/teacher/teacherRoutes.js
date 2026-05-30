const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const {
  getMyCourses,
  getCourse,
  createCourse,
  updateCourse,
  addSection,
  addLecture,
  updateLecture,
  deleteLecture,
  publishCourse,
  getCourseStudents,
} = require("../../controllers/teacher/teacherCourseController");
const {
  createQuiz,
  getMyQuizzes,
  updateQuiz,
  deleteQuiz,
  getQuizResults,
} = require("../../controllers/teacher/teacherQuizController");
const {
  markAttendance,
  getAttendanceRecords,
  getAttendanceAnalytics,
  exportAttendanceCsv,
} = require("../../controllers/teacher/teacherAttendanceController");
const {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
} = require("../../controllers/teacher/teacherScheduleController");
const {
  getStudentDoubts,
  answerDoubt,
} = require("../../controllers/teacher/teacherDoubtController");
const {
  scheduleLiveClass,
  getMyLiveClasses,
  updateLiveClass,
} = require("../../controllers/teacher/teacherLiveController");
const {
  getTeacherDashboard,
} = require("../../controllers/teacher/teacherDashboardController");

router.use(protect, authorize("teacher", "admin"));

// Dashboard
router.get("/dashboard", getTeacherDashboard);

// Courses
router.get("/courses", getMyCourses);
router.get("/courses/:id", getCourse);
router.get("/courses/:id/students", getCourseStudents);
router.post("/courses", upload.fields([{ name: "thumbnail", maxCount: 1 }]), createCourse);
router.put("/courses/:id", upload.fields([{ name: "thumbnail", maxCount: 1 }]), updateCourse);
router.post("/courses/:id/publish", publishCourse);
router.post("/courses/:id/sections", addSection);
router.post(
  "/courses/:id/sections/:sectionId/lectures",
  upload.fields([{ name: "video", maxCount: 1 }, { name: "resources", maxCount: 5 }]),
  addLecture
);
router.patch(
  "/courses/:courseId/lectures/:lectureId",
  upload.fields([{ name: "video", maxCount: 1 }, { name: "resources", maxCount: 5 }]),
  updateLecture
);
router.delete("/courses/:courseId/lectures/:lectureId", deleteLecture);

// Quizzes
router.get("/quizzes", getMyQuizzes);
router.post("/quizzes", createQuiz);
router.put("/quizzes/:id", updateQuiz);
router.delete("/quizzes/:id", deleteQuiz);
router.get("/quizzes/:id/results", getQuizResults);

// Attendance
router.post("/attendance", markAttendance);
router.get("/attendance", getAttendanceRecords);
router.get("/attendance/analytics", getAttendanceAnalytics);
router.get("/attendance/export", exportAttendanceCsv);

// Lecture Schedule
router.get("/schedule", getSchedules);
router.post("/schedule", createSchedule);
router.put("/schedule/:id", updateSchedule);
router.delete("/schedule/:id", deleteSchedule);

// Doubts
router.get("/doubts", getStudentDoubts);
router.post("/doubts/:id/answer", answerDoubt);

// Live Classes
router.get("/live-classes", getMyLiveClasses);
router.post("/live-classes", scheduleLiveClass);
router.put("/live-classes/:id", updateLiveClass);

module.exports = router;
