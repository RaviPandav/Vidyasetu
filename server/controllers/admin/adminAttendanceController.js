const Attendance = require("../../models/Attendance");
const Course = require("../../models/Course");
const User = require("../../models/User");

const isPresent = (status) => status === "YES" || status === "present" || status === "late";
const isAbsent = (status) => status === "NO" || status === "absent";
const studentIdFor = (record) => record.student?._id?.toString?.() || record.student?.toString?.();

const statsFor = (records = []) => {
  const total = records.length;
  const present = records.filter((record) => isPresent(record.status)).length;
  const absent = records.filter((record) => isAbsent(record.status)).length;
  return {
    total,
    present,
    absent,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };
};

const getAttendanceAnalytics = async (req, res) => {
  try {
    const { courseId, studentId } = req.query;
    const query = { lectureNumber: { $exists: true } };
    if (courseId) query.course = courseId;
    if (studentId) query["records.student"] = studentId;

    const [attendance, courses, students] = await Promise.all([
      Attendance.find(query)
        .populate("course", "title offlineLecturesTaken")
        .populate("teacher", "name")
        .populate("records.student", "name email")
        .sort({ date: -1, lectureNumber: -1 })
        .limit(300)
        .lean(),
      Course.find({}).select("title teacher offlineLecturesTaken").populate("teacher", "name").sort({ title: 1 }).lean(),
      User.find({ role: "student" }).select("name email enrolledCourses").sort({ name: 1 }).lean(),
    ]);

    const filteredAttendance = studentId
      ? attendance.map((session) => ({
          ...session,
          records: (session.records || []).filter((record) => studentIdFor(record) === studentId),
        })).filter((session) => session.records.length > 0)
      : attendance;

    const allRecords = filteredAttendance.flatMap((session) => session.records || []);
    const byCourseMap = new Map();
    filteredAttendance.forEach((session) => {
      const id = session.course?._id?.toString() || "unknown";
      const existing = byCourseMap.get(id) || { course: session.course, sessions: 0, records: [] };
      existing.sessions += 1;
      existing.records.push(...(session.records || []));
      byCourseMap.set(id, existing);
    });

    const byCourse = Array.from(byCourseMap.values()).map((item) => ({
      course: item.course,
      sessions: item.sessions,
      maxLectures: 100,
      lecturesTaken: item.course?.offlineLecturesTaken || item.sessions,
      ...statsFor(item.records),
    }));

    const studentMap = new Map();
    filteredAttendance.forEach((session) => {
      (session.records || []).forEach((record) => {
        const id = studentIdFor(record);
        if (!id) return;
        const existing = studentMap.get(id) || {
          student: record.student,
          course: session.course,
          records: [],
        };
        existing.records.push(record);
        studentMap.set(id, existing);
      });
    });

    const studentRankings = Array.from(studentMap.values())
      .map((item) => ({ student: item.student, course: item.course, ...statsFor(item.records) }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.percentage - a.percentage);

    const dailyMap = new Map();
    filteredAttendance.forEach((session) => {
      const key = new Date(session.date).toISOString().slice(0, 10);
      const existing = dailyMap.get(key) || [];
      existing.push(...(session.records || []));
      dailyMap.set(key, existing);
    });

    const trends = Array.from(dailyMap.entries())
      .map(([date, records]) => ({ date, ...statsFor(records) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      analytics: {
        overview: statsFor(allRecords),
        byCourse,
        trends,
        recentSessions: filteredAttendance,
        topStudents: studentRankings.slice(0, 5),
        bottomStudents: [...studentRankings].reverse().slice(0, 5),
        courses,
        students,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAttendanceAnalytics };
