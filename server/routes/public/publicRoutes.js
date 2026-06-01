const express = require("express");
const router = express.Router();
const Course = require("../../models/Course");
const User = require("../../models/User");
const Inquiry = require("../../models/Inquiry");

// GET /api/public/courses - Get all published courses with filters
router.get("/courses", async (req, res) => {
  try {
    const { category, level, language, search, sort, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true, isApproved: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (language) query.language = language;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { enrollmentCount: -1 },
      rating: { "rating.average": -1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
    };

    const courses = await Course.find(query)
      .populate("teacher", "name avatar bio")
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-sections");

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/public/courses/:slug - Get single course
router.get("/courses/:slug", async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      isPublished: true,
      isApproved: true,
    })
      .populate("teacher", "name avatar bio expertise qualifications")
      .populate("reviews.user", "name avatar");

    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    // Hide lecture video URLs for non-enrolled users (preview only)
    const sanitized = course.toObject();
    sanitized.sections = sanitized.sections.map((section) => ({
      ...section,
      lectures: section.lectures.map((lecture) => ({
        ...lecture,
        videoUrl: lecture.isFree ? lecture.videoUrl : undefined,
      })),
    }));

    res.json({ success: true, course: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/public/teachers - Get all teachers
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher", isActive: true })
      .select("name avatar bio expertise qualifications teachingCourses")
      .populate("teachingCourses", "title thumbnail rating");
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/public/cors-debug - Check CORS origin and allowed origins
router.get("/cors-debug", (req, res) => {
  res.json({
    success: true,
    origin: req.get("Origin") || null,
    allowedOrigins: Array.from(require("../../config/corsOptions").allowedOrigins),
  });
});

// POST /api/public/inquiry - Submit inquiry/lead form
router.post("/inquiry", async (req, res) => {
  try {
    const { name, email, phone, subject, message, courseInterest } = req.body;
    await Inquiry.create({
      name,
      email,
      phone,
      subject,
      message,
      courseInterest,
    });

    res.json({
      success: true,
      message: "Thank you for your inquiry! We will contact you within 24 hours.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
