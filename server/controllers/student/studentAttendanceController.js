const Attendance = require("../../models/Attendance");
const User = require("../../models/User");
const Course = require("../../models/Course");
const LectureSchedule = require("../../models/LectureSchedule");
const Notification = require("../../models/Notification");

const isPresent = (status) => status === "YES" || status === "present" || status === "late";
const isAbsent = (status) => status === "NO" || status === "absent";

const calculateStats = (summary = []) => {
  const total = summary.length;
  const present = summary.filter((s) => isPresent(s.status)).length;
  const absent = summary.filter((s) => isAbsent(s.status)).length;
  return {
    total,
    present,
    absent,
    percentage: total > 0 ? Math.round((present / total) * 100) : 0,
  };
};

const getMyAttendance = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean();
    const enrolledIds = student.enrolledCourses.map((e) => e.course);

    const records = await Attendance.find({
      course: { $in: enrolledIds },
      "records.student": req.user._id,
      lectureNumber: { $exists: true },
    })
      .populate("course", "title offlineLecturesTaken")
      .populate("schedule", "title subject scheduledAt duration mode liveLink status")
      .sort({ date: -1, lectureNumber: -1 });

    const summary = records.map((r) => {
      const myRecord = r.records.find((rec) => rec.student.toString() === req.user._id.toString());
      return {
        date: r.date,
        course: r.course,
        sessionTitle: r.sessionTitle,
        sessionType: r.sessionType,
        lectureNumber: r.lectureNumber,
        lectureId: r.lectureId,
        schedule: r.schedule,
        status: myRecord?.status || "absent",
        remark: myRecord?.remark,
        source: myRecord?.source || "manual",
        watchedPercent: myRecord?.watchedPercent || 0,
      };
    });

    const monthly = summary.reduce((acc, item) => {
      const key = new Date(item.date).toISOString().slice(0, 7);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      attendance: summary,
      stats: calculateStats(summary),
      courseStats: Object.entries(summary.reduce((acc, item) => {
        const id = item.course?._id?.toString() || "unknown";
        acc[id] = acc[id] || { course: item.course, records: [] };
        acc[id].records.push(item);
        return acc;
      }, {})).map(([, item]) => ({ ...item, ...calculateStats(item.records) })),
      monthly: Object.entries(monthly).map(([month, items]) => ({ month, ...calculateStats(items) })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upsertAutoAttendance = async ({ studentId, courseId, lectureId, scheduleId, teacherId, status, source, watchedPercent, joinedAt }) => {
  const date = new Date();
  let attendance = await Attendance.findOne({
    course: courseId,
    ...(scheduleId ? { schedule: scheduleId } : {}),
    ...(lectureId ? { lectureId } : {}),
    date: {
      $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    },
  });

  if (!attendance) {
    attendance = await Attendance.create({
      course: courseId,
      teacher: teacherId,
      lectureId,
      schedule: scheduleId,
      date,
      sessionTitle: "Auto attendance",
      sessionType: "lecture",
      mode: "auto",
      records: [],
    });
  }

  const record = attendance.records.find((item) => item.student?.toString() === studentId.toString());
  const payload = { student: studentId, status, source, watchedPercent, joinedAt };
  if (record) Object.assign(record, payload);
  else attendance.records.push(payload);
  attendance.mode = attendance.mode === "manual" ? "mixed" : attendance.mode;
  await attendance.save();
  return attendance;
};

const markVideoAttendance = async (req, res) => {
  try {
    const { courseId, lectureId, watchedPercent = 0 } = req.body;
    const student = await User.findById(req.user._id).lean();
    const enrolled = student.enrolledCourses.some((entry) => entry.course.toString() === courseId);
    if (!enrolled) return res.status(403).json({ success: false, message: "You are not enrolled in this course." });

    const course = await Course.findById(courseId).select("teacher title");
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const attendance = await upsertAutoAttendance({
      studentId: req.user._id,
      courseId,
      lectureId,
      teacherId: course.teacher,
      status: Number(watchedPercent) >= 70 ? "present" : "absent",
      source: "video_watch",
      watchedPercent: Math.min(100, Number(watchedPercent) || 0),
    });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markLiveJoinAttendance = async (req, res) => {
  try {
    const schedule = await LectureSchedule.findById(req.params.scheduleId);
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found." });

    const student = await User.findById(req.user._id).lean();
    const enrolled = student.enrolledCourses.some((entry) => entry.course.toString() === schedule.course.toString());
    if (!enrolled) return res.status(403).json({ success: false, message: "You are not enrolled in this course." });

    const lateAfter = new Date(schedule.scheduledAt).getTime() + 10 * 60 * 1000;
    const status = Date.now() > lateAfter ? "late" : "present";
    const attendance = await upsertAutoAttendance({
      studentId: req.user._id,
      courseId: schedule.course,
      lectureId: schedule.lectureId,
      scheduleId: schedule._id,
      teacherId: schedule.teacher,
      status,
      source: "live_join",
      joinedAt: new Date(),
    });

    res.json({ success: true, status, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendLowAttendanceWarning = async (studentId, percentage) => {
  if (percentage >= 75) return;
  await Notification.create({
    recipient: studentId,
    type: "low_attendance",
    title: "Attendance warning",
    message: `Your attendance is ${percentage}%. Please attend upcoming lectures to stay above 75%.`,
    link: "/student/attendance",
  });
};

module.exports = { getMyAttendance, markVideoAttendance, markLiveJoinAttendance, sendLowAttendanceWarning };
