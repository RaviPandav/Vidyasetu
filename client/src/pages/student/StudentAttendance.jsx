import { useEffect, useState } from "react";
import { studentService } from "../../services";

const statusClass = {
  YES: "bg-green-100 text-green-700",
  NO: "bg-red-100 text-red-700",
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
};

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getAttendance()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-32 skeleton rounded-2xl" /><div className="h-64 skeleton rounded-2xl" /></div>;
  }

  const stats = data?.stats || {};
  const records = data?.attendance || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Offline Attendance</h1>
        <p className="text-sm text-gray-500">Your physical class attendance marked by teachers.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Conducted", value: stats.total || 0, color: "text-primary-600" },
          { label: "Present", value: stats.present || 0, color: "text-green-600" },
          { label: "Absent", value: stats.absent || 0, color: "text-red-500" },
          { label: "Percentage", value: `${stats.percentage || 0}%`, color: stats.percentage >= 75 ? "text-green-600" : "text-red-500" },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <div className={`font-heading text-3xl font-bold ${item.color}`}>{item.value}</div>
            <div className="mt-1 text-sm text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-gray-700">Present: {stats.present || 0} / {stats.total || 0}</span>
          <span className={`font-bold ${stats.percentage >= 75 ? "text-green-600" : "text-red-500"}`}>{stats.percentage || 0}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className={`h-3 rounded-full transition-all ${stats.percentage >= 75 ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(stats.percentage || 0, 100)}%` }}
          />
        </div>
        {stats.total > 0 && stats.percentage < 75 && (
          <p className="mt-2 text-xs font-medium text-red-500">Warning: your attendance is below 75%.</p>
        )}
      </div>

      {data?.courseStats?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.courseStats.map((item) => (
            <div key={item.course?._id} className="card">
              <p className="truncate font-semibold text-gray-900">{item.course?.title}</p>
              <p className="mt-2 text-sm text-gray-500">Present {item.present} / {item.total}</p>
              <p className={`mt-1 font-heading text-2xl font-bold ${item.percentage >= 75 ? "text-green-600" : "text-red-500"}`}>{item.percentage}%</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        <h3 className="mb-4 font-heading text-lg font-bold text-gray-900">Lecture Records</h3>
        {records.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No offline attendance records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Lecture No", "Date", "Course", "Status"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left font-semibold text-gray-600">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((rec) => (
                <tr key={`${rec.course?._id}-${rec.lectureNumber}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{rec.lectureNumber || "-"}</td>
                  <td className="px-4 py-3">{new Date(rec.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">{rec.course?.title || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusClass[rec.status] || "bg-gray-100 text-gray-700"}`}>
                      {rec.status === "present" ? "YES" : rec.status === "absent" ? "NO" : rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
