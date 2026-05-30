const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    }, // e.g. "course_<courseId>" or "doubt_<doubtId>"
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: { type: String, default: "" },
    isRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
