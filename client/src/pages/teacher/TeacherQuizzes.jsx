import { useEffect, useState } from "react";
import { teacherService } from "../../services";
import toast from "react-hot-toast";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

function QuizForm({ quiz, onSave, onClose }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(quiz || { title: "", description: "", duration: 30, passingMarks: 0, questions: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    teacherService.getCourses()
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => toast.error("Failed to load courses"));
  }, []);

  useEffect(() => {
    if (!quiz && courses.length > 0 && !form.course) {
      setForm((prev) => ({ ...prev, course: courses[0]._id }));
    }
  }, [courses, quiz, form.course]);

  const addQuestion = () => setForm({
    ...form,
    questions: [...form.questions, { question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "", marks: 1 }]
  });

  const updateQuestion = (idx, key, val) => {
    const qs = [...form.questions];
    qs[idx] = { ...qs[idx], [key]: val };
    setForm({ ...form, questions: qs });
  };

  const updateOption = (qIdx, oIdx, val) => {
    const qs = [...form.questions];
    const opts = [...qs[qIdx].options];
    opts[oIdx] = val;
    qs[qIdx] = { ...qs[qIdx], options: opts };
    setForm({ ...form, questions: qs });
  };

  const removeQuestion = (idx) => setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const totalMarks = form.questions.reduce((acc, q) => acc + (q.marks || 1), 0);
    const payload = { ...form, totalMarks };
    try {
      if (quiz?._id) {
        await teacherService.updateQuiz(quiz._id, payload);
        toast.success("Quiz updated!");
      } else {
        await teacherService.createQuiz(payload);
        toast.success("Quiz created!");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save quiz");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-heading text-xl font-bold">{quiz ? "Edit Quiz" : "Create Quiz"}</h2>
          <button onClick={onClose} className="btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quiz Title *</label>
              <input type="text" required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
              <input type="number" min="1" className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course *</label>
            <select
              required
              className="input-field"
              value={form.course || ""}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            >
              <option value="" disabled>Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea rows={2} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Questions ({form.questions.length})</h3>
              <button type="button" onClick={addQuestion} className="btn-secondary text-sm">
                <PlusIcon className="w-4 h-4" /> Add Question
              </button>
            </div>
            {form.questions.map((q, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-primary-600 text-sm">Q{idx + 1}</span>
                  <button type="button" onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-600 p-1">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <input type="text" className="input-field" placeholder="Question text..." value={q.question} onChange={(e) => updateQuestion(idx, "question", e.target.value)} required />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Type</label>
                    <select className="input-field text-sm" value={q.type} onChange={(e) => updateQuestion(idx, "type", e.target.value)}>
                      <option value="mcq">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Marks</label>
                    <input type="number" min="1" className="input-field text-sm" value={q.marks} onChange={(e) => updateQuestion(idx, "marks", +e.target.value)} />
                  </div>
                </div>
                {q.type === "mcq" && (
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <input key={oi} type="text" className="input-field text-sm" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} />
                    ))}
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Correct Answer *</label>
                  {q.type === "true_false" ? (
                    <select className="input-field text-sm" value={q.correctAnswer} onChange={(e) => updateQuestion(idx, "correctAnswer", e.target.value)}>
                      <option value="">Select...</option>
                      <option>True</option>
                      <option>False</option>
                    </select>
                  ) : (
                    <input type="text" required className="input-field text-sm" placeholder="Correct answer..." value={q.correctAnswer} onChange={(e) => updateQuestion(idx, "correctAnswer", e.target.value)} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Passing Marks</label>
            <input type="number" min="0" className="input-field" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: +e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Saving..." : "Save Quiz"}</button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);

  const fetchQuizzes = () => {
    teacherService.getQuizzes()
      .then((res) => setQuizzes(res.data.quizzes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      await teacherService.deleteQuiz(id);
      toast.success("Quiz deleted");
      fetchQuizzes();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      {(showForm || editQuiz) && (
        <QuizForm
          quiz={editQuiz}
          onSave={() => { setShowForm(false); setEditQuiz(null); fetchQuizzes(); }}
          onClose={() => { setShowForm(false); setEditQuiz(null); }}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Quizzes & Tests</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <PlusIcon className="w-4 h-4" /> Create Quiz
        </button>
      </div>
      {quizzes.length === 0 ? (
        <div className="card text-center py-20 text-gray-500">No quizzes yet. Create your first quiz!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading font-bold text-gray-900">{quiz.title}</h3>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button onClick={() => setEditQuiz(quiz)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(quiz._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">📚 {quiz.course?.title || "General"}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>⏱ {quiz.duration} min</span>
                <span>📝 {quiz.questions?.length || 0} questions</span>
                <span>🎯 {quiz.totalMarks} marks</span>
                <span>👥 {quiz.attempts?.length || 0} attempts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
