import { useEffect, useState, useRef } from "react";
import { studentService } from "../../services";
import toast from "react-hot-toast";
import { ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

function QuizTimer({ duration, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); onExpire(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 60;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${urgent ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-700"}`}>
      <ClockIcon className="w-5 h-5" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}

function ActiveQuiz({ quiz, onFinish }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((q) => ({
        questionId: q._id,
        answer: answers[q._id] || "",
      }));
      const res = await studentService.submitQuiz(quiz._id, { answers: formattedAnswers, timeTaken: quiz.duration * 60 });
      onFinish(res.data.result);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit quiz";
      toast.error(`😔 ${msg}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="card flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-sm text-gray-500">{quiz.questions?.length} questions · {quiz.totalMarks} marks</p>
        </div>
        <QuizTimer duration={quiz.duration} onExpire={handleSubmit} />
      </div>

      <div className="space-y-4">
        {quiz.questions?.map((q, idx) => (
          <div key={q._id} className="card">
            <p className="font-semibold text-gray-900 mb-4">
              <span className="text-primary-600 mr-2">Q{idx + 1}.</span>{q.question}
              <span className="text-xs text-gray-400 ml-2">({q.marks} mark{q.marks > 1 ? "s" : ""})</span>
            </p>
            <div className="space-y-2">
              {q.type === "true_false" ? (
                ["True", "False"].map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q._id] === opt ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="radio" name={q._id} value={opt} onChange={() => setAnswers({ ...answers, [q._id]: opt })} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${answers[q._id] === opt ? "border-primary-500" : "border-gray-400"}`}>
                      {answers[q._id] === opt && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                    </div>
                    <span className="font-medium">{opt}</span>
                  </label>
                ))
              ) : q.type === "short_answer" ? (
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Type your answer..."
                  value={answers[q._id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                />
              ) : (
                q.options?.map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q._id] === opt ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="radio" name={q._id} value={opt} onChange={() => setAnswers({ ...answers, [q._id]: opt })} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[q._id] === opt ? "border-primary-500" : "border-gray-400"}`}>
                      {answers[q._id] === opt && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                    </div>
                    <span>{opt}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-3 text-base">
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
}

function QuizResult({ result, onBack }) {
  const percent = Math.round(result.percentage);
  const hasCorrectAnswer = Number(result.score) > 0;
  const color = hasCorrectAnswer ? "text-success-500" : "text-danger-500";

  return (
    <div className="card max-w-md mx-auto text-center py-10">
      <div className={`text-6xl font-heading font-bold mb-2 ${color}`}>{percent}%</div>
      <div className={`text-xl font-semibold mb-1 ${color}`}>{result.isPassed ? "🎉 Passed!" : "😔Failed"}</div>
      <p className="text-gray-600 mb-2">Score: <strong>{result.score}</strong> / {result.totalMarks}</p>
      <CheckCircleIcon className={`w-16 h-16 mx-auto my-4 ${result.isPassed ? "text-success-500" : "text-gray-300"}`} />
      <button onClick={onBack} className="btn-primary mt-4">Back to Quizzes</button>
    </div>
  );
}

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    studentService.getQuizzes()
      .then((res) => setQuizzes(res.data.quizzes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (result) return <QuizResult result={result} onBack={() => { setResult(null); setActiveQuiz(null); }} />;
  if (activeQuiz) return <ActiveQuiz quiz={activeQuiz} onFinish={setResult} />;

  if (loading) return <div className="space-y-4 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}</div>;

  const formatPassingThreshold = (quiz) => {
    if (quiz.totalMarks > 0 && quiz.passingMarks > quiz.totalMarks && quiz.passingMarks <= 100) {
      return `${quiz.passingMarks}%`;
    }
    return `${quiz.passingMarks} marks`;
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-gray-900">Available Quizzes</h1>
      {quizzes.length === 0 ? (
        <div className="card text-center py-20 text-gray-500">
          <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No quizzes available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-heading font-bold text-gray-900">{quiz.title}</h3>
                <span className="badge-primary text-xs">{quiz.duration} min</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">📚 {quiz.course?.title}</p>
              <p className="text-sm text-gray-500 mb-4">
                {quiz.questions?.length || 0} questions · {quiz.totalMarks} marks · Pass: {formatPassingThreshold(quiz)}
              </p>
              <button onClick={() => setActiveQuiz(quiz)} className="btn-primary w-full text-sm">
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
