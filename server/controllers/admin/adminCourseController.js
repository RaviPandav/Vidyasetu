const Course = require("../../models/Course");

// GET /api/admin/courses
const getAllCourses = async (req, res) => {
  try {
    const { isApproved, isPublished, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === "true";
    if (isPublished !== undefined) query.isPublished = isPublished === "true";
    if (search) query.title = { $regex: search, $options: "i" };

    const courses = await Course.find(query)
      .populate("teacher", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-sections");

    const total = await Course.countDocuments(query);
    res.json({ success: true, courses, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/courses/:id/approve
const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    course.isApproved = !course.isApproved;
    await course.save();
    res.json({ success: true, message: `Course ${course.isApproved ? "approved" : "unapproved"}.`, isApproved: course.isApproved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    res.json({ success: true, message: "Course deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCourses, approveCourse, deleteCourse };
