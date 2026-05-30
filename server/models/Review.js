const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, maxlength: 100 },
    comment: { type: String, maxlength: 1000 },
    isApproved: { type: Boolean, default: true },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// One review per student per course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Update course average rating after saving
reviewSchema.post("save", async function () {
  const Course = mongoose.model("Course");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { course: this.course, isApproved: true } },
    { $group: { _id: "$course", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(this.course, {
      "rating.average": Math.round(stats[0].avgRating * 10) / 10,
      "rating.count": stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);
