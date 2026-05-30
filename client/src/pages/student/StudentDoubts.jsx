import { useEffect, useState } from "react";
import { studentService } from "../../services";
import toast from "react-hot-toast";
import { ChatBubbleLeftRightIcon, PlusIcon, HandThumbUpIcon } from "@heroicons/react/24/outline";

const statusBadge = { open: "badge-warning", answered: "badge-success", closed: "bg-gray-100 text-gray-600 badge" };

export default function StudentDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchDoubts = () => {
    studentService.getDoubts()
      .then((res) => setDoubts(res.data.doubts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentService.createDoubt(form);
      toast.success("Doubt posted successfully!");
      setForm({ title: "", description: "" });
      setShowForm(false);
      fetchDoubts();
    } catch {
      toast.error("Failed to post doubt");
    }
    setSubmitting(false);
  };

  const handleUpvote = async (id) => {
    try {
      await studentService.upvoteDoubt(id);
      fetchDoubts();
    } catch {
      toast.error("Failed to upvote");
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-gray-900">My Doubts</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <PlusIcon className="w-4 h-4" /> Ask a Doubt
        </button>
      </div>

      {/* New Doubt Form */}
      {showForm && (
        <div className="card border-2 border-primary-200">
          <h3 className="font-heading font-bold text-lg mb-4 text-gray-900">Post a New Doubt</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Short title for your doubt..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                required
                rows={4}
                className="input-field"
                placeholder="Explain your doubt in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting ? "Posting..." : "Post Doubt"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {doubts.length === 0 ? (
        <div className="card text-center py-20">
          <ChatBubbleLeftRightIcon className="w-14 h-14 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No doubts posted yet. Ask your first doubt!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => (
            <div key={doubt._id} className="card">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setExpanded(expanded === doubt._id ? null : doubt._id)}
                    className="text-left"
                  >
                    <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{doubt.title}</h3>
                  </button>
                  <p className="text-xs text-gray-400 mt-1">{new Date(doubt.createdAt).toLocaleDateString("en-IN")} · {doubt.course?.title || "General"}</p>
                </div>
                <span className={`${statusBadge[doubt.status] || "badge"} flex-shrink-0 capitalize`}>{doubt.status}</span>
              </div>

              {expanded === doubt._id && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-sm text-gray-700 mb-4">{doubt.description}</p>

                  {/* Answers */}
                  {doubt.answers?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700">💬 Answers ({doubt.answers.length})</h4>
                      {doubt.answers.map((answer, i) => (
                        <div key={i} className={`p-3 rounded-xl ${answer.isAccepted ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-xs font-bold">
                              {answer.author?.name?.[0] || "T"}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{answer.author?.name}</span>
                            <span className="badge-primary text-xs capitalize">{answer.author?.role}</span>
                            {answer.isAccepted && <span className="badge-success text-xs ml-auto">✓ Accepted</span>}
                          </div>
                          <p className="text-sm text-gray-700">{answer.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {doubt.status === "open" && doubt.answers?.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Waiting for a teacher to answer...</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => handleUpvote(doubt._id)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <HandThumbUpIcon className="w-4 h-4" />
                  {doubt.upvotes?.length || 0} upvotes
                </button>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-500">{doubt.answers?.length || 0} answer{doubt.answers?.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
