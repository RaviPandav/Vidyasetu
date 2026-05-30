const Doubt = require("../../models/Doubt");
const Course = require("../../models/Course");
const Notification = require("../../models/Notification");

const getStudentDoubts = async (req, res) => {
  try {
    const { status, courseId } = req.query;
    const teacherCourseIds = await Course.find({ teacher: req.user._id }).distinct("_id");

    // Teacher should see doubts for the teacher's courses.
    // Also include doubts created without a course (course: null / missing).
    const query = {
      $or: [
        { course: { $in: teacherCourseIds } },
        { course: null },
        { course: { $exists: false } },
      ],
    };

    if (status) query.status = status;
    if (courseId) {
      query.course = teacherCourseIds.some((id) => id.toString() === courseId)
        ? courseId
        : null;
    }

    const doubts = await Doubt.find(query)
      .populate("student", "name avatar email")
      .populate("course", "title")
      .sort({ createdAt: -1 });
    res.json({ success: true, doubts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const answerDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found." });

    doubt.answers.push({
      author: req.user._id,
      content: req.body.content,
    });
    doubt.status = "answered";
    await doubt.save();

    await Notification.create({
      recipient: doubt.student,
      sender: req.user._id,
      type: "doubt_answered",
      title: "Your doubt has been answered",
      message: doubt.title,
      link: "/student/doubts",
      data: { doubtId: doubt._id },
    });

    res.json({ success: true, doubt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudentDoubts, answerDoubt };
