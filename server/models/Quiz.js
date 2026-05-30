const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ["mcq", "true_false", "short_answer"],
    default: "mcq",
  },
  options: [String], // for MCQ
  correctAnswer: { type: String, required: true },
  explanation: String,
  marks: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [questionSchema],
    duration: { type: Number, default: 30 }, // in minutes
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    startTime: Date,
    endTime: Date,
    isActive: { type: Boolean, default: true },
    attempts: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        answers: [{ questionId: mongoose.Schema.Types.ObjectId, answer: String }],
        score: Number,
        percentage: Number,
        timeTaken: Number, // seconds
        submittedAt: { type: Date, default: Date.now },
        isPassed: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
