const mongoose = require("mongoose");

const liveClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    meetingLink: String, // Zoom or WebRTC room link
    meetingId: String,
    meetingPassword: String,
    platform: {
      type: String,
      enum: ["zoom", "webrtc", "google_meet"],
      default: "zoom",
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    recordingUrl: String,
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveClass", liveClassSchema);
