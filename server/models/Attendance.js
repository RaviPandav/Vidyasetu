const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lectureId: { type: mongoose.Schema.Types.ObjectId },
    lectureNumber: {
      type: Number,
      min: 1,
      max: 100,
    },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "LectureSchedule" },
    date: { type: Date, required: true },
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["YES", "NO", "present", "absent", "late"],
          default: "NO",
        },
        remark: String,
        source: {
          type: String,
          enum: ["manual", "live_join", "video_watch", "qr"],
          default: "manual",
        },
        joinedAt: Date,
        watchedPercent: { type: Number, default: 0 },
      },
    ],
    sessionTitle: String,
    sessionType: {
      type: String,
      enum: ["lecture", "lab", "test", "doubt_session"],
      default: "lecture",
    },
    mode: {
      type: String,
      enum: ["manual", "auto", "mixed"],
      default: "manual",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ course: 1, lectureId: 1, date: 1 });
attendanceSchema.index({ course: 1, lectureNumber: 1 });
attendanceSchema.index({ course: 1, date: -1 });
attendanceSchema.index({ "records.student": 1, date: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
