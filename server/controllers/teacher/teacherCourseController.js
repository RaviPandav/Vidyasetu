const Course = require("../../models/Course");
const User = require("../../models/User");

const parseListField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Keep supporting plain textarea payloads from older clients.
  }

  return value.split("\n").map((item) => item.trim()).filter(Boolean);
};

const buildCoursePayload = (body, file) => {
  const allowedFields = [
    "title",
    "description",
    "shortDescription",
    "category",
    "level",
    "language",
    "price",
    "discountPrice",
    "requirements",
    "learningOutcomes",
    "targetAudience",
    "thumbnail",
  ];
  const payload = {};

  allowedFields.forEach((key) => {
    if (body[key] !== undefined) {
      payload[key] = body[key];
    }
  });

  ["requirements", "learningOutcomes", "targetAudience"].forEach((key) => {
    if (payload[key] !== undefined) {
      payload[key] = parseListField(payload[key]);
    }
  });

  ["price", "discountPrice"].forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== "") {
      payload[key] = Number(payload[key]);
    }
  });

  if (file) {
    payload.thumbnail = `/uploads/thumbnails/${file.filename}`;
  }

  return payload;
};

const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...buildCoursePayload(req.body, req.files?.thumbnail?.[0]),
      teacher: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { teachingCourses: course._id },
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    Object.assign(course, buildCoursePayload(req.body, req.files?.thumbnail?.[0]));
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const publishCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ success: true, isPublished: course.isPublished });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addSection = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    course.sections.push({ title: req.body.title, order: course.sections.length });
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addLecture = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found." });

    const videoFile = req.files?.video?.[0];
    const lectureData = {
      ...req.body,
      videoUrl: videoFile ? `/uploads/videos/${videoFile.filename}` : req.body.videoUrl,
      order: section.lectures.length,
    };

    section.lectures.push(lectureData);
    course.totalLectures = course.sections.reduce((acc, s) => acc + s.lectures.length, 0);
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLecture = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    let lectureFound = null;
    course.sections.forEach((section) => {
      const lecture = section.lectures.id(req.params.lectureId);
      if (lecture) lectureFound = lecture;
    });

    if (!lectureFound) {
      return res.status(404).json({ success: false, message: "Lecture not found." });
    }

    if (req.body.title !== undefined) lectureFound.title = req.body.title;
    if (req.body.description !== undefined) lectureFound.description = req.body.description;
    const videoFile = req.files?.video?.[0];
    if (videoFile) {
      lectureFound.videoUrl = `/uploads/videos/${videoFile.filename}`;
    }

    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    course.sections.forEach((section) => {
      section.lectures = section.lectures.filter(
        (l) => l._id.toString() !== req.params.lectureId
      );
    });
    course.totalLectures = course.sections.reduce((acc, s) => acc + s.lectures.length, 0);
    await course.save();
    res.json({ success: true, message: "Lecture deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id }).select("_id");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const students = await User.find({
      role: "student",
      "enrolledCourses.course": course._id,
    }).select("name email avatar");

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyCourses,
  createCourse,
  updateCourse,
  publishCourse,
  addSection,
  addLecture,
  updateLecture,
  deleteLecture,
  getCourse,
  getCourseStudents,
};
