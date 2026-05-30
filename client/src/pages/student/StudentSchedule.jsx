import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDaysIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { studentService } from "../../services";

export default function StudentSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = () => {
    studentService.getSchedule()
      .then((res) => setSchedules(res.data.schedules || []))
      .catch(() => toast.error("Failed to load schedule"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchedule(); }, []);

  const joinLecture = async (item) => {
    try {
      await studentService.joinScheduledLecture(item._id);
      toast.success("Attendance marked from live join");
      if (item.liveLink) window.open(item.liveLink, "_blank", "noreferrer");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not mark attendance");
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todaysLectures = schedules.filter((item) => new Date(item.scheduledAt).toISOString().slice(0, 10) === today);

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-28 skeleton rounded-2xl" /><div className="h-80 skeleton rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Lecture Schedule</h1>
        <p className="text-sm text-gray-500">Today&apos;s classes and upcoming timetable.</p>
      </div>

      <div className="card">
        <h2 className="font-heading mb-4 text-lg font-bold text-gray-900">Today</h2>
        {todaysLectures.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No lectures today.</p>
        ) : (
          <div className="space-y-3">
            {todaysLectures.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.course?.title} · {item.subject || "Lecture"}</p>
                  <p className="text-sm text-primary-600">{new Date(item.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {item.duration} min · {item.mode}</p>
                </div>
                {item.mode === "online" && (
                  <button onClick={() => joinLecture(item)} className="btn-primary text-sm">
                    <VideoCameraIcon className="w-4 h-4" /> Join
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-heading mb-4 text-lg font-bold text-gray-900">Upcoming Timetable</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-600">
              {["Date", "Course", "Lecture", "Mode", "Status"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {schedules.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <CalendarDaysIcon className="mr-2 inline h-4 w-4 text-primary-500" />
                  {new Date(item.scheduledAt).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 font-medium">{item.course?.title}</td>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3 capitalize">{item.mode}</td>
                <td className="px-4 py-3"><span className="badge capitalize">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
