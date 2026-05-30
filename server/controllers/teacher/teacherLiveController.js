// teacherLiveController.js
const LiveClass = require("../../models/LiveClass");
const Course = require("../../models/Course");

const scheduleLiveClass = async (req, res) => {
  try {
    if (!req.body.course) {
      return res.status(400).json({ success: false, message: "Course is required." });
    }

    const course = await Course.findOne({ _id: req.body.course, teacher: req.user._id }).select("_id");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const liveClass = await LiveClass.create({ ...req.body, teacher: req.user._id });
    res.status(201).json({ success: true, liveClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyLiveClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find({ teacher: req.user._id })
      .populate("course", "title")
      .sort({ scheduledAt: -1 });
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLiveClass = async (req, res) => {
  try {
    if (req.body.course) {
      const course = await Course.findOne({ _id: req.body.course, teacher: req.user._id }).select("_id");
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found." });
      }
    }

    const liveClass = await LiveClass.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body,
      { new: true }
    );
    if (!liveClass) return res.status(404).json({ success: false, message: "Live class not found." });
    res.json({ success: true, liveClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { scheduleLiveClass, getMyLiveClasses, updateLiveClass };
