const mongoose = require("mongoose");

const lectureHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated", "rescheduled", "cancelled", "completed"],
      default: "created",
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: String,
    snapshot: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const lectureScheduleSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    lectureId: { type: mongoose.Schema.Types.ObjectId },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60, min: 1 },
    mode: { type: String, enum: ["online", "offline"], default: "online" },
    liveLink: String,
    location: String,
    videoUrl: String,
    notesUrl: String,
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "pending", "cancelled"],
      default: "scheduled",
    },
    reminderMinutesBefore: { type: Number, default: 15 },
    reminderSent: { type: Boolean, default: false },
    history: [lectureHistorySchema],
  },
  { timestamps: true }
);

lectureScheduleSchema.index({ course: 1, scheduledAt: 1 });
lectureScheduleSchema.index({ teacher: 1, scheduledAt: 1 });
lectureScheduleSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model("LectureSchedule", lectureScheduleSchema);
