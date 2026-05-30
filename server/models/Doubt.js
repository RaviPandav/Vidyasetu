const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ name: String, url: String }],
    status: {
      type: String,
      enum: ["open", "answered", "closed"],
      default: "open",
    },
    answers: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true },
        isAccepted: { type: Boolean, default: false },
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doubt", doubtSchema);
