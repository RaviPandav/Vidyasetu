const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "course_update",
        "new_lecture",
        "test_alert",
        "doubt_answered",
        "payment_success",
        "live_class_reminder",
        "lecture_reminder",
        "low_attendance",
        "schedule_update",
        "announcement",
        "enrollment",
        "result",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
    data: mongoose.Schema.Types.Mixed, // extra metadata
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
