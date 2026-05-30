const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const Review = require("../../models/Review");
const Course = require("../../models/Course");

// POST /api/reviews/:courseId — Add a review (student only)
router.post("/:courseId", protect, authorize("student"), async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    // Check student is enrolled
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const existing = await Review.findOne({ course: req.params.courseId, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: "You have already reviewed this course." });

    const review = await Review.create({
      course: req.params.courseId,
      student: req.user._id,
      rating,
      title,
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reviews/:courseId — Get all reviews for a course
router.get("/:courseId", async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId, isApproved: true })
      .populate("student", "name avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/reviews/:id/helpful — Vote helpful
router.patch("/:id/helpful", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    const idx = review.helpfulVotes.indexOf(req.user._id);
    if (idx === -1) {
      review.helpfulVotes.push(req.user._id);
    } else {
      review.helpfulVotes.splice(idx, 1);
    }
    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulVotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reviews/:id — Delete own review
router.delete("/:id", protect, authorize("student", "admin"), async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, student: req.user._id };
    const review = await Review.findOneAndDelete(filter);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    res.json({ success: true, message: "Review deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
