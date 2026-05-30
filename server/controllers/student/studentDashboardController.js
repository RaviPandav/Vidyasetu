// ── studentDashboardController.js ─────────────────────────
const User = require("../../models/User");
const Quiz = require("../../models/Quiz");
const Attendance = require("../../models/Attendance");
const LiveClass = require("../../models/LiveClass");
const LectureSchedule = require("../../models/LectureSchedule");

const getStudentDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate("enrolledCourses.course", "title thumbnail teacher category")
      .lean();

    const enrolledCourseIds = student.enrolledCourses.map((e) => e.course?._id).filter(Boolean);

    const [upcomingClasses, todaysLectures, recentQuizResults] = await Promise.all([
      LiveClass.find({
        course: { $in: enrolledCourseIds },
        scheduledAt: { $gte: new Date() },
        status: "scheduled",
      })
        .populate("course", "title")
        .populate("teacher", "name avatar")
        .sort({ scheduledAt: 1 })
        .limit(3),
      LectureSchedule.find({
        course: { $in: enrolledCourseIds },
        scheduledAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
        status: { $ne: "cancelled" },
      })
        .populate("course", "title")
        .populate("teacher", "name avatar")
        .sort({ scheduledAt: 1 })
        .limit(5),
      Quiz.find({
        course: { $in: enrolledCourseIds },
        "attempts.student": req.user._id,
      })
        .select("title attempts")
        .lean(),
    ]);

    const myResults = recentQuizResults.map((q) => ({
      quizTitle: q.title,
      attempt: q.attempts.find((a) => a.student.toString() === req.user._id.toString()),
    }));

    const overallProgress =
      student.enrolledCourses.reduce((acc, e) => acc + (e.progress || 0), 0) /
      (student.enrolledCourses.length || 1);

    res.json({
      success: true,
      data: {
        student: { name: student.name, avatar: student.avatar, email: student.email },
        stats: {
          enrolledCourses: student.enrolledCourses.length,
          overallProgress: Math.round(overallProgress),
          completedCourses: student.enrolledCourses.filter((e) => e.progress >= 100).length,
          quizzesTaken: myResults.length,
        },
        enrolledCourses: student.enrolledCourses,
        upcomingClasses,
        todaysLectures,
        recentResults: myResults.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentLiveClasses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean();
    const enrolledCourseIds = student?.enrolledCourses?.map((entry) => entry.course).filter(Boolean) || [];

    // NOTE: Avoid strict scheduledAt >= now filtering here,
    // because datetime-local timezone parsing can store values in the past.
    const classes = await LiveClass.find({
      course: { $in: enrolledCourseIds },
      status: { $in: ["scheduled", "live"] },
    })
      .populate("course", "title")
      .populate("teacher", "name avatar")
      .sort({ scheduledAt: 1 })
      .lean();

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudentDashboard, getStudentLiveClasses };
