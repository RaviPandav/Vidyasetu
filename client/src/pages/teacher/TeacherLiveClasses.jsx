import { useEffect, useState } from "react";
import { teacherService } from "../../services";
import toast from "react-hot-toast";
import { PlusIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

function LiveClassForm({ onSave, onClose }) {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", course: "", scheduledAt: "", duration: 60, meetingLink: "", platform: "zoom" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    teacherService.getCourses()
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => toast.error("Failed to load courses"));
  }, []);

  useEffect(() => {
    if (courses.length > 0 && !form.course) {
      setForm((prev) => ({ ...prev, course: courses[0]._id }));
    }
  }, [courses, form.course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teacherService.scheduleLiveClass(form);
      toast.success("Live class scheduled!");
      onSave();
    } catch {
      toast.error("Failed to schedule class");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Schedule Live Class</h2>
          <button onClick={onClose} className="btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Title *</label>
            <input type="text" required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Doubt Clearing Session - Calculus" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea rows={2} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course *</label>
            <select
              required
              className="input-field"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            >
              <option value="" disabled>Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time *</label>
              <input type="datetime-local" required className="input-field" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (mins)</label>
              <input type="number" min="15" className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
            <select className="input-field" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <option value="zoom">Zoom</option>
              <option value="google_meet">Google Meet</option>
              <option value="webrtc">WebRTC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Link</label>
            <input type="url" className="input-field" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://zoom.us/j/..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Scheduling..." : "Schedule Class"}</button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const statusColor = { scheduled: "badge-primary", live: "bg-red-100 text-red-700 badge", completed: "badge-success", cancelled: "bg-gray-100 text-gray-600 badge" };

export default function TeacherLiveClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchClasses = () => {
    teacherService.getLiveClasses()
      .then((res) => setClasses(res.data.classes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClasses(); }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      {showForm && <LiveClassForm onSave={() => { setShowForm(false); fetchClasses(); }} onClose={() => setShowForm(false)} />}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Live Classes</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
          <PlusIcon className="w-4 h-4" /> Schedule Class
        </button>
      </div>
      {classes.length === 0 ? (
        <div className="card text-center py-20">
          <VideoCameraIcon className="w-14 h-14 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No live classes scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => (
            <div key={cls._id} className="card flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-2xl flex-shrink-0">🎥</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-gray-900 truncate">{cls.title}</h3>
                <p className="text-sm text-gray-500">{cls.course?.title}</p>
                <p className="text-sm text-gray-500">🕐 {new Date(cls.scheduledAt).toLocaleString("en-IN")} · {cls.duration} min</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`capitalize ${statusColor[cls.status] || "badge"}`}>{cls.status}</span>
                {cls.meetingLink && (
                  <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">Join Link →</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
