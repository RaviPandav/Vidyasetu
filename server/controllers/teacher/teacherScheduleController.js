const Course = require("../../models/Course");
const LectureSchedule = require("../../models/LectureSchedule");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

const createSchedule = async (req, res) => {
  try {
    const { course: courseId } = req.body;
    const course = await Course.findOne({ _id: courseId, teacher: req.user._id }).select("_id title");
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const schedule = await LectureSchedule.create({
      ...req.body,
      teacher: req.user._id,
      history: [{ action: "created", changedBy: req.user._id, snapshot: req.body }],
    });

    const students = await User.find({ role: "student", "enrolledCourses.course": course._id })
      .select("_id")
      .lean();
    if (students.length > 0) {
      await Notification.insertMany(students.map((student) => ({
        recipient: student._id,
        sender: req.user._id,
        type: "schedule_update",
        title: "New lecture scheduled",
        message: `${schedule.title} is scheduled for ${new Date(schedule.scheduledAt).toLocaleString("en-IN")}.`,
        link: "/student/schedule",
        data: { schedule: schedule._id, course: course._id },
      })));
    }

    res.status(201).json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSchedules = async (req, res) => {
  try {
    const { from, to, courseId, status } = req.query;
    const query = { teacher: req.user._id };
    if (courseId) query.course = courseId;
    if (status) query.status = status;
    if (from || to) {
      query.scheduledAt = {};
      if (from) query.scheduledAt.$gte = new Date(from);
      if (to) query.scheduledAt.$lte = new Date(to);
    }

    const schedules = await LectureSchedule.find(query)
      .populate("course", "title")
      .sort({ scheduledAt: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    if (req.body.course) {
      const course = await Course.findOne({ _id: req.body.course, teacher: req.user._id }).select("_id");
      if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    }

    const existing = await LectureSchedule.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!existing) return res.status(404).json({ success: false, message: "Schedule not found." });

    const wasRescheduled = req.body.scheduledAt && new Date(req.body.scheduledAt).getTime() !== existing.scheduledAt.getTime();
    Object.assign(existing, req.body);
    existing.history.push({
      action: req.body.status === "cancelled" ? "cancelled" : wasRescheduled ? "rescheduled" : "updated",
      changedBy: req.user._id,
      snapshot: req.body,
    });
    await existing.save();

    res.json({ success: true, schedule: existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await LectureSchedule.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      { status: "cancelled", $push: { history: { action: "cancelled", changedBy: req.user._id } } },
      { new: true }
    );
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found." });
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSchedule, getSchedules, updateSchedule, deleteSchedule };
