const User = require("../../models/User");
const LectureSchedule = require("../../models/LectureSchedule");

const getMySchedule = async (req, res) => {
  try {
    const { from, to, today } = req.query;
    const student = await User.findById(req.user._id).lean();
    const courseIds = student.enrolledCourses.map((entry) => entry.course);
    const query = { course: { $in: courseIds }, status: { $ne: "cancelled" } };

    if (today === "true") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.scheduledAt = { $gte: start, $lt: end };
    } else if (from || to) {
      query.scheduledAt = {};
      if (from) query.scheduledAt.$gte = new Date(from);
      if (to) query.scheduledAt.$lte = new Date(to);
    }

    const schedules = await LectureSchedule.find(query)
      .populate("course", "title")
      .populate("teacher", "name avatar")
      .sort({ scheduledAt: 1 })
      .lean();

    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMySchedule };
