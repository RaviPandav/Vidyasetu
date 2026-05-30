const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const {
  getDashboard,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require("../../controllers/admin/adminUserController");
const {
  getAllCourses,
  approveCourse,
  deleteCourse,
} = require("../../controllers/admin/adminCourseController");
const {
  getAllPayments,
  getPaymentStats,
} = require("../../controllers/admin/adminPaymentController");
const {
  sendNotification,
} = require("../../controllers/admin/adminNotificationController");
const {
  getAttendanceAnalytics,
} = require("../../controllers/admin/adminAttendanceController");
const { getInquiries } = require("../../controllers/admin/adminInquiryController");


// All admin routes protected
router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle-status", toggleUserStatus);

// Course Management
router.get("/courses", getAllCourses);
router.patch("/courses/:id/approve", approveCourse);
router.delete("/courses/:id", deleteCourse);

// Payment Management
router.get("/payments", getAllPayments);
router.get("/payments/stats", getPaymentStats);

// Notifications
router.post("/notifications/send", sendNotification);

// Attendance and schedule analytics
router.get("/attendance/analytics", getAttendanceAnalytics);

// Inquiries
router.get("/inquiries", getInquiries);

module.exports = router;

