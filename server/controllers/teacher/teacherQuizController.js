// ─── teacherQuizController.js ────────────────────────────
const Quiz = require("../../models/Quiz");
const Course = require("../../models/Course");

const createQuiz = async (req, res) => {
  try {
    const { course: courseId, questions = [] } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course is required." });
    }

    const course = await Course.findOne({ _id: courseId, teacher: req.user._id }).select("_id");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const totalMarks = questions.reduce((sum, question) => sum + (Number(question.marks) || 1), 0);
    const quiz = await Quiz.create({
      ...req.body,
      course: courseId,
      totalMarks,
      teacher: req.user._id,
    });
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user._id }).populate("course", "title").sort({ createdAt: -1 });
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    if (req.body.course) {
      const course = await Course.findOne({ _id: req.body.course, teacher: req.user._id }).select("_id");
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found." });
      }
    }

    const payload = { ...req.body };
    if (Array.isArray(payload.questions)) {
      payload.totalMarks = payload.questions.reduce(
        (sum, question) => sum + (Number(question.marks) || 1),
        0
      );
    }

    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      payload,
      { new: true, runValidators: true }
    );
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    res.json({ success: true, message: "Quiz deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacher: req.user._id })
      .populate("attempts.student", "name email avatar");
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    res.json({ success: true, results: quiz.attempts, quiz: { title: quiz.title, totalMarks: quiz.totalMarks, passingMarks: quiz.passingMarks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createQuiz, getMyQuizzes, updateQuiz, deleteQuiz, getQuizResults };
