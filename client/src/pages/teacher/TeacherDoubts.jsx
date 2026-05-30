import { useEffect, useState } from "react";
import { teacherService } from "../../services";
import toast from "react-hot-toast";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function TeacherDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchDoubts = () => {
    teacherService.getDoubts()
      .then((res) => setDoubts(res.data.doubts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleAnswer = async (id) => {
    if (!answers[id]?.trim()) return;
    setSubmitting(id);
    try {
      await teacherService.answerDoubt(id, answers[id]);
      toast.success("Answer posted!");
      setAnswers({ ...answers, [id]: "" });
      fetchDoubts();
    } catch {
      toast.error("Failed to post answer");
    }
    setSubmitting(null);
  };

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>;

  const open = doubts.filter((d) => d.status === "open");
  const answered = doubts.filter((d) => d.status !== "open");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Student Doubts</h1>
        <p className="text-gray-500 mt-1">{open.length} open · {answered.length} answered</p>
      </div>

      {doubts.length === 0 ? (
        <div className="card text-center py-20">
          <ChatBubbleLeftRightIcon className="w-14 h-14 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No student doubts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => (
            <div key={doubt._id} className={`card border-l-4 ${doubt.status === "open" ? "border-orange-400" : "border-green-400"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <button onClick={() => setExpanded(expanded === doubt._id ? null : doubt._id)} className="text-left w-full">
                    <h3 className="font-semibold text-gray-900 hover:text-primary-600">{doubt.title}</h3>
                  </button>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">👤 {doubt.student?.name}</span>
                    {doubt.course && <span className="text-xs text-gray-500">📚 {doubt.course.title}</span>}
                    <span className="text-xs text-gray-400">{new Date(doubt.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 capitalize ${doubt.status === "open" ? "badge-warning" : "badge-success"}`}>{doubt.status}</span>
              </div>

              {expanded === doubt._id && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-sm text-gray-700">{doubt.description}</p>

                  {/* Existing answers */}
                  {doubt.answers?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Previous Answers:</h4>
                      {doubt.answers.map((a, i) => (
                        <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-xs font-bold">{a.author?.name?.[0]}</div>
                            <span className="text-sm font-semibold">{a.author?.name}</span>
                          </div>
                          <p className="text-sm text-gray-700">{a.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer form */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                    <textarea
                      rows={3}
                      className="input-field"
                      placeholder="Type your answer here..."
                      value={answers[doubt._id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [doubt._id]: e.target.value })}
                    />
                    <button
                      onClick={() => handleAnswer(doubt._id)}
                      disabled={submitting === doubt._id}
                      className="btn-primary text-sm"
                    >
                      {submitting === doubt._id ? "Posting..." : "Post Answer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
