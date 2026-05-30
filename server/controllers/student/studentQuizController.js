// studentQuizController.js
const Quiz = require("../../models/Quiz");
const User = require("../../models/User");

const getAvailableQuizzes = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean();
    const enrolledIds = student.enrolledCourses.map((e) => e.course);
    const quizzes = await Quiz.find({ course: { $in: enrolledIds }, isActive: true })
      .populate("course", "title")
      .select("-questions.correctAnswer -attempts");
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });

    const { answers, timeTaken } = req.body;
    let score = 0;
    const evaluated = answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      const isCorrect = question && question.correctAnswer === ans.answer;
      if (isCorrect) score += question.marks;
      return { questionId: ans.questionId, answer: ans.answer };
    });

    const percentage = (score / quiz.totalMarks) * 100;
    const isPassed = (() => {
      // Support both raw mark thresholds and percentage-style thresholds.
      if (quiz.totalMarks > 0 && quiz.passingMarks > quiz.totalMarks && quiz.passingMarks <= 100) {
        return percentage >= quiz.passingMarks;
      }
      return score >= quiz.passingMarks;
    })();

    quiz.attempts.push({
      student: req.user._id,
      answers: evaluated,
      score,
      percentage,
      timeTaken,
      isPassed,
    });
    await quiz.save();

    res.json({ success: true, result: { score, percentage, isPassed, totalMarks: quiz.totalMarks } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyResults = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ "attempts.student": req.user._id })
      .populate("course", "title")
      .select("title attempts totalMarks passingMarks");

    const results = quizzes.map((q) => ({
      quizId: q._id,
      title: q.title,
      course: q.course,
      totalMarks: q.totalMarks,
      passingMarks: q.passingMarks,
      attempt: q.attempts.find((a) => a.student.toString() === req.user._id.toString()),
    }));

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAvailableQuizzes, submitQuiz, getMyResults };
