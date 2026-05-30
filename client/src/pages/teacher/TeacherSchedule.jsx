import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDaysIcon, PencilSquareIcon, PlusIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { teacherService } from "../../services";

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

function ScheduleForm({ initial, courses, onClose, onSaved }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    course: initial.course?._id || initial.course || "",
    scheduledAt: initial.scheduledAt ? new Date(initial.scheduledAt).toISOString().slice(0, 16) : "",
  } : {
    course: courses[0]?._id || "",
    subject: "",
    title: "",
    scheduledAt: "",
    duration: 60,
    mode: "online",
    liveLink: "",
    location: "",
    videoUrl: "",
    notesUrl: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (initial?._id) await teacherService.updateSchedule(initial._id, form);
      else await teacherService.createSchedule(form);
      toast.success(initial?._id ? "Lecture updated" : "Lecture scheduled");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-gray-900">{initial?._id ? "Edit Lecture" : "Create Lecture Schedule"}</h2>
          <button type="button" onClick={onClose} className="btn-ghost">Close</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select required className="input-field" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
          <input className="input-field" placeholder="Subject" value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <input required className="input-field md:col-span-2" placeholder="Lecture title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input required type="datetime-local" className="input-field" value={form.scheduledAt?.slice?.(0, 16) || form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <input type="number" min="1" className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
          <select className="input-field" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <select className="input-field" value={form.status || "scheduled"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input className="input-field" placeholder="Live link" value={form.liveLink || ""} onChange={(e) => setForm({ ...form, liveLink: e.target.value })} />
          <input className="input-field" placeholder="Room / location" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="input-field" placeholder="Video URL" value={form.videoUrl || ""} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          <input className="input-field" placeholder="Notes URL" value={form.notesUrl || ""} onChange={(e) => setForm({ ...form, notesUrl: e.target.value })} />
        </div>
        <div className="flex gap-3">
          <button disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Schedule"}</button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default function TeacherSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      teacherService.getSchedule(),
      teacherService.getCourses(),
    ])
      .then(([scheduleRes, courseRes]) => {
        setSchedules(scheduleRes.data.schedules || []);
        setCourses(courseRes.data.courses || []);
      })
      .catch(() => toast.error("Failed to load schedule"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const monthDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = [];
    for (let day = 1; day <= end.getDate(); day += 1) days.push(new Date(start.getFullYear(), start.getMonth(), day));
    return days;
  }, [selectedDate]);

  const cancelSchedule = async (id) => {
    try {
      await teacherService.cancelSchedule(id);
      toast.success("Lecture cancelled");
      fetchData();
    } catch {
      toast.error("Failed to cancel lecture");
    }
  };

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-10 skeleton" /><div className="h-96 skeleton rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      {editing && <ScheduleForm initial={editing._id === "new" ? null : editing} courses={courses} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchData(); }} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Lecture Schedule</h1>
          <p className="text-sm text-gray-500">Create, reschedule, cancel, and track daily lectures.</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setEditing({ _id: "new" })}>
          <PlusIcon className="w-4 h-4" /> New Lecture
        </button>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <button className="btn-ghost text-sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>Previous</button>
          <h2 className="font-heading font-bold text-lg">{selectedDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h2>
          <button className="btn-ghost text-sm" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>Next</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-3">
          {monthDays.map((day) => {
            const dayKey = day.toISOString().slice(0, 10);
            const dayItems = schedules.filter((item) => new Date(item.scheduledAt).toISOString().slice(0, 10) === dayKey);
            return (
              <div key={dayKey} className="min-h-32 rounded-xl border border-gray-100 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
                  {day.getDate()}
                </div>
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <div key={item._id} className="rounded-lg bg-primary-50 p-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{new Date(item.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {item.duration}m</p>
                      <p className="text-xs text-primary-700">{item.course?.title}</p>
                      <div className="mt-2 flex gap-2">
                        <button className="rounded-md p-1 text-gray-500 hover:bg-white" onClick={() => setEditing(item)} title="Edit">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button className="rounded-md p-1 text-red-500 hover:bg-white" onClick={() => cancelSchedule(item._id)} title="Cancel">
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
