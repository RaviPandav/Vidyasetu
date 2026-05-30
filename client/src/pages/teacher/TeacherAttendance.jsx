import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDownTrayIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { teacherService } from "../../services";

export default function TeacherAttendance() {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseId: "", sessionTitle: "", date: "", records: [] });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [attendanceRes, coursesRes, analyticsRes] = await Promise.all([
      teacherService.getAttendance(),
      teacherService.getCourses(),
      teacherService.getAttendanceAnalytics(),
    ]);
    setRecords(attendanceRes.data.records || []);
    setCourseProgress(attendanceRes.data.courseProgress || []);
    setCourses(coursesRes.data.courses || []);
    setAnalytics(analyticsRes.data.analytics || null);
  };

  useEffect(() => {
    loadData().catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showForm || !form.courseId) {
      setStudents([]);
      return;
    }

    teacherService.getCourseStudents(form.courseId)
      .then((res) => {
        const courseStudents = res.data.students || [];
        setStudents(courseStudents);
        setForm((prev) => ({
          ...prev,
          records: courseStudents.map((student) => {
            const existing = prev.records.find((record) => record.student === student._id);
            return existing || { student: student._id, status: "YES" };
          }),
        }));
      })
      .catch(() => toast.error("Failed to load course students"));
  }, [showForm, form.courseId]);

  const selectedProgress = useMemo(
    () => courseProgress.find((item) => item.courseId === form.courseId),
    [courseProgress, form.courseId]
  );

  const updateStudentStatus = (studentId, status) => {
    setForm((prev) => ({
      ...prev,
      records: prev.records.map((record) =>
        record.student === studentId ? { ...record, status } : record
      ),
    }));
  };

  const markAllPresent = () => {
    setForm((prev) => ({
      ...prev,
      records: prev.records.map((record) => ({ ...record, status: "YES" })),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (students.length === 0) return toast.error("No students found for this course");

    setSubmitting(true);
    try {
      await teacherService.markAttendance(form);
      toast.success("Offline attendance submitted");
      setShowForm(false);
      setForm({ courseId: "", sessionTitle: "", date: "", records: [] });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await teacherService.exportAttendance(form.courseId ? { courseId: form.courseId } : undefined);
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "offline-attendance.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export attendance");
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Offline Attendance</h1>
          <p className="text-sm text-gray-500">Mark each physical class as YES or NO. Every course is capped at 100 lectures.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExport} className="btn-ghost text-sm">
            <ArrowDownTrayIcon className="h-4 w-4" /> CSV
          </button>
          <button onClick={() => setShowForm((value) => !value)} className="btn-primary text-sm">
            <PlusIcon className="h-4 w-4" /> Mark Lecture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {(analytics?.byCourse || []).slice(0, 4).map((item) => (
          <div key={item.course?._id} className="card">
            <p className="truncate text-sm font-medium text-gray-600">{item.course?.title}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <span className={`font-heading text-3xl font-bold ${item.percentage >= 75 ? "text-green-600" : "text-red-500"}`}>
                {item.percentage}%
              </span>
              <span className="text-xs text-gray-500">{item.lecturesTaken}/100 lectures</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card border-2 border-primary-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Course *</label>
                <select
                  required
                  className="input-field"
                  value={form.courseId}
                  onChange={(event) => setForm({ ...form, courseId: event.target.value, records: [] })}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Lecture</label>
                <div className="input-field bg-gray-50">
                  {selectedProgress ? `${selectedProgress.nextLectureNumber} / 100` : "Select course"}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={selectedProgress ? `Lecture ${selectedProgress.nextLectureNumber}` : "Lecture title"}
                  value={form.sessionTitle}
                  onChange={(event) => setForm({ ...form, sessionTitle: event.target.value })}
                />
              </div>
            </div>

            {form.courseId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-gray-900">Students</h3>
                  <button type="button" onClick={markAllPresent} className="btn-ghost text-sm">
                    <CheckCircleIcon className="h-4 w-4" /> Mark All Present
                  </button>
                </div>

                {students.length === 0 ? (
                  <p className="rounded-xl border border-gray-100 p-4 text-sm text-gray-500">No enrolled students found.</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => {
                      const record = form.records.find((item) => item.student === student._id);
                      const status = record?.status || "YES";

                      return (
                        <div key={student._id} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{student.name}</p>
                            <p className="truncate text-xs text-gray-500">{student.email}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:w-48">
                            {["YES", "NO"].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => updateStudentStatus(student._id, value)}
                                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                                  status === value
                                    ? value === "YES" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting || !form.courseId} className="btn-primary text-sm">
                {submitting ? "Submitting..." : "Submit Attendance"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="card py-16 text-center text-gray-500">No offline attendance submitted yet.</div>
        ) : records.map((rec) => (
          <div key={rec._id} className="card flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Lecture {rec.lectureNumber}: {rec.sessionTitle}</h3>
              <p className="text-sm text-gray-500">{rec.course?.title} | {new Date(rec.date).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center sm:w-72">
              <div><p className="font-bold text-green-600">{rec.stats?.present || 0}</p><p className="text-xs text-gray-500">YES</p></div>
              <div><p className="font-bold text-red-500">{rec.stats?.absent || 0}</p><p className="text-xs text-gray-500">NO</p></div>
              <div><p className="font-bold text-primary-600">{rec.stats?.percentage || 0}%</p><p className="text-xs text-gray-500">Class</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
