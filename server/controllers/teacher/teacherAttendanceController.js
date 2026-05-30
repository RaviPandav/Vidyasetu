const Attendance = require("../../models/Attendance");
const Course = require("../../models/Course");
const User = require("../../models/User");

const MAX_OFFLINE_LECTURES = 100;

const isPresent = (status) => status === "YES" || status === "present" || status === "late";
const isAbsent = (status) => status === "NO" || status === "absent";
const studentIdFor = (record) => record.student?._id?.toString?.() || record.student?.toString?.();

const calculateStats = (records = []) => {
  const total = records.length;
  const present = records.filter((record) => isPresent(record.status)).length;
  const absent = records.filter((record) => isAbsent(record.status)).length;
  return {
    total,
    present,
    absent,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
  };
};

const getNextLectureNumber = async (course) => {
  if (course.offlineLecturesTaken > 0) return course.offlineLecturesTaken + 1;

  const latest = await Attendance.findOne({ course: course._id, lectureNumber: { $exists: true } })
    .sort({ lectureNumber: -1 })
    .select("lectureNumber")
    .lean();

  return (latest?.lectureNumber || 0) + 1;
};

const normalizeManualRecords = (records) =>
  records.map((record) => ({
    student: record.student || record.studentId,
    status: record.status === "YES" || record.status === "present" ? "YES" : "NO",
    remark: record.remark || "",
    source: "manual",
  }));

const markAttendance = async (req, res) => {
  try {
    const { courseId, date, records, sessionTitle } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course is required." });
    }

    const course = await Course.findOne({ _id: courseId, teacher: req.user._id });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: "Attendance records are required." });
    }

    const lectureNumber = await getNextLectureNumber(course);
    if (lectureNumber > MAX_OFFLINE_LECTURES) {
      return res.status(400).json({
        success: false,
        message: "This course has already reached the maximum of 100 offline lectures.",
      });
    }

    const normalizedRecords = normalizeManualRecords(records);
    const attendance = await Attendance.create({
      course: courseId,
      teacher: req.user._id,
      lectureNumber,
      date: date || new Date(),
      records: normalizedRecords,
      sessionTitle: sessionTitle || `Lecture ${lectureNumber}`,
      sessionType: "lecture",
      mode: "manual",
    });

    course.offlineLecturesTaken = lectureNumber;
    await course.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      attendance,
      lectureNumber,
      lecturesTaken: course.offlineLecturesTaken,
      maxLectures: MAX_OFFLINE_LECTURES,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceRecords = async (req, res) => {
  try {
    const { courseId, from, to } = req.query;
    const query = { teacher: req.user._id, lectureNumber: { $exists: true } };
    if (courseId) query.course = courseId;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const records = await Attendance.find(query)
      .populate("course", "title offlineLecturesTaken")
      .populate("records.student", "name email avatar")
      .sort({ date: -1, lectureNumber: -1 });

    const enriched = records.map((record) => {
      const item = record.toObject();
      item.stats = calculateStats(item.records);
      return item;
    });

    const courses = await Course.find({ teacher: req.user._id })
      .select("_id title offlineLecturesTaken")
      .sort({ title: 1 })
      .lean();

    res.json({
      success: true,
      records: enriched,
      courseProgress: courses.map((course) => ({
        courseId: course._id,
        title: course.title,
        lecturesTaken: course.offlineLecturesTaken || 0,
        nextLectureNumber: Math.min((course.offlineLecturesTaken || 0) + 1, MAX_OFFLINE_LECTURES),
        maxLectures: MAX_OFFLINE_LECTURES,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceAnalytics = async (req, res) => {
  try {
    const { courseId } = req.query;
    const courseQuery = { teacher: req.user._id };
    if (courseId) courseQuery._id = courseId;

    const courses = await Course.find(courseQuery).select("_id title offlineLecturesTaken").lean();
    const courseIds = courses.map((course) => course._id);
    const attendance = await Attendance.find({
      course: { $in: courseIds },
      lectureNumber: { $exists: true },
    }).lean();

    const byCourse = courses.map((course) => {
      const sessions = attendance.filter((item) => item.course?.toString() === course._id.toString());
      const flat = sessions.flatMap((session) => session.records || []);
      return {
        course,
        sessions: sessions.length,
        lecturesTaken: course.offlineLecturesTaken || sessions.length,
        maxLectures: MAX_OFFLINE_LECTURES,
        ...calculateStats(flat),
      };
    });

    const lowAttendance = [];
    for (const course of courses) {
      const students = await User.find({ role: "student", "enrolledCourses.course": course._id })
        .select("name email")
        .lean();
      students.forEach((student) => {
        const studentRecords = attendance
          .filter((item) => item.course?.toString() === course._id.toString())
          .map((item) => item.records?.find((record) => studentIdFor(record) === student._id.toString()))
          .filter(Boolean);
        const stats = calculateStats(studentRecords);
        if (stats.total > 0 && stats.percentage < 75) lowAttendance.push({ student, course, ...stats });
      });
    }

    res.json({ success: true, analytics: { byCourse, lowAttendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportAttendanceCsv = async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { teacher: req.user._id, lectureNumber: { $exists: true } };
    if (courseId) query.course = courseId;

    const records = await Attendance.find(query)
      .populate("course", "title")
      .populate("records.student", "name email")
      .sort({ lectureNumber: 1 })
      .lean();

    const lines = ["Lecture No,Date,Course,Student,Email,Status,Remark"];
    records.forEach((session) => {
      (session.records || []).forEach((record) => {
        lines.push([
          session.lectureNumber || "",
          new Date(session.date).toISOString().slice(0, 10),
          session.course?.title || "",
          record.student?.name || "",
          record.student?.email || "",
          record.status || "",
          record.remark || "",
        ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","));
      });
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=offline-attendance.csv");
    res.send(lines.join("\n"));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { markAttendance, getAttendanceRecords, getAttendanceAnalytics, exportAttendanceCsv };
