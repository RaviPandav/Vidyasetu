const Course = require("../../models/Course");
const Quiz = require("../../models/Quiz");
const User = require("../../models/User");
const Doubt = require("../../models/Doubt");

const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const teacherCourseIds = await Course.find({ teacher: teacherId }).distinct("_id");

    const [courses, openDoubts, quizzes, totalStudents] = await Promise.all([
      Course.find({ teacher: teacherId }).select("title enrollmentCount rating isPublished"),
      Doubt.countDocuments({ status: "open", course: { $in: teacherCourseIds } }),
      Quiz.find({ teacher: teacherId }).select("title attempts").lean(),
      User.countDocuments({
        role: "student",
        "enrolledCourses.course": { $in: teacherCourseIds },
      }),
    ]);

    const totalQuizAttempts = quizzes.reduce((acc, q) => acc + (q.attempts?.length || 0), 0);
    const avgRating =
      courses.reduce((acc, c) => acc + (c.rating?.average || 0), 0) / (courses.length || 1);

    res.json({
      success: true,
      data: {
        stats: {
          totalCourses: courses.length,
          totalStudents,
          openDoubts,
          totalQuizAttempts,
          avgRating: avgRating.toFixed(1),
        },
        courses,
        quizzes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTeacherDashboard };
