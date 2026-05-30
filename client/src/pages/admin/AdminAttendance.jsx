import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { adminService } from "../../services";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AdminAttendance() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ courseId: "", studentId: "" });
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async (nextFilters = filters) => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value));
    try {
      const res = await adminService.getAttendanceAnalytics(params);
      setData(res.data.analytics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    loadAnalytics(next);
  };

  if (loading && !data) {
    return <div className="space-y-4 animate-pulse"><div className="h-28 skeleton rounded-2xl" /><div className="h-80 skeleton rounded-2xl" /></div>;
  }

  const overview = data?.overview || {};
  const chartData = {
    labels: (data?.trends || []).map((item) => item.date),
    datasets: [{
      label: "Attendance %",
      data: (data?.trends || []).map((item) => item.percentage),
      borderColor: "#6C63FF",
      backgroundColor: "rgba(108,99,255,0.18)",
      tension: 0.35,
    }],
  };

  const rankingRows = [
    { title: "Top Attendance", rows: data?.topStudents || [], color: "text-green-600" },
    { title: "Bottom Attendance", rows: data?.bottomStudents || [], color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Offline Attendance</h1>
        <p className="text-sm text-gray-500">Course-wise attendance, student filters, and 75% risk tracking.</p>
      </div>

      <div className="card grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Filter by course</label>
          <select className="input-field" value={filters.courseId} onChange={(event) => updateFilter("courseId", event.target.value)}>
            <option value="">All courses</option>
            {(data?.courses || []).map((course) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Filter by student</label>
          <select className="input-field" value={filters.studentId} onChange={(event) => updateFilter("studentId", event.target.value)}>
            <option value="">All students</option>
            {(data?.students || []).map((student) => (
              <option key={student._id} value={student._id}>{student.name} ({student.email})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Records", overview.total || 0],
          ["YES", overview.present || 0],
          ["NO", overview.absent || 0],
          ["Average", `${overview.percentage || 0}%`],
        ].map(([label, value]) => (
          <div key={label} className="card text-center">
            <div className="font-heading text-3xl font-bold text-primary-600">{value}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 font-heading text-lg font-bold text-gray-900">Daily Attendance Trend</h2>
        <Line data={chartData} options={{ responsive: true, scales: { y: { min: 0, max: 100 } } }} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card overflow-x-auto">
          <h2 className="mb-4 font-heading text-lg font-bold text-gray-900">Course Summary</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {(data?.byCourse || []).map((item) => (
                <tr key={item.course?._id}>
                  <td className="py-3 font-medium">{item.course?.title || "Unknown"}</td>
                  <td className="py-3 text-gray-500">{item.lecturesTaken}/100 lectures</td>
                  <td className="py-3 text-right font-semibold text-primary-600">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {rankingRows.map((group) => (
            <div key={group.title} className="card overflow-x-auto">
              <h2 className="mb-4 font-heading text-lg font-bold text-gray-900">{group.title}</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {group.rows.length === 0 ? (
                    <tr><td className="py-3 text-gray-400">No attendance data yet.</td></tr>
                  ) : group.rows.map((item) => (
                    <tr key={`${group.title}-${item.student?._id}`}>
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{item.student?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{item.student?.email}</p>
                      </td>
                      <td className="py-3 text-gray-500">{item.present}/{item.total}</td>
                      <td className={`py-3 text-right font-semibold ${group.color}`}>{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-4 font-heading text-lg font-bold text-gray-900">Recent Lectures</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Lecture", "Date", "Course", "Teacher", "YES", "NO"].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left font-semibold text-gray-600">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(data?.recentSessions || []).slice(0, 12).map((item) => {
              const yes = (item.records || []).filter((record) => record.status === "YES" || record.status === "present").length;
              const no = (item.records || []).filter((record) => record.status === "NO" || record.status === "absent").length;
              return (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.lectureNumber}</td>
                  <td className="px-4 py-3">{new Date(item.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">{item.course?.title || "-"}</td>
                  <td className="px-4 py-3">{item.teacher?.name || "-"}</td>
                  <td className="px-4 py-3 text-green-600">{yes}</td>
                  <td className="px-4 py-3 text-red-500">{no}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
