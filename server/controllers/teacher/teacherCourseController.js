const Course = require("../../models/Course");
const User = require("../../models/User");
const {
  uploadThumbnail,
  uploadVideo,
  deleteFromCloudinary,
} = require("../../services/cloudinaryService");

const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(value || "");
const isLocalUploadUrl = (value) => /^\/?uploads\//i.test(value || "");

const requireValidRemoteVideo = (videoUrl) => {
  if (!videoUrl) return;
  if (isLocalUploadUrl(videoUrl)) {
    const error = new Error("Local video paths are not allowed. Upload the video to Cloudinary.");
    error.statusCode = 400;
    throw error;
  }
  if (!isHttpUrl(videoUrl)) {
    const error = new Error("Video URL must be a valid http(s) URL.");
    error.statusCode = 400;
    throw error;
  }
};

const ensureUploadResult = (uploaded, context) => {
  if (!uploaded || !uploaded.url || !uploaded.publicId) {
    const error = new Error(`Cloudinary ${context} did not return a valid URL and publicId.`);
    error.statusCode = 502;
    throw error;
  }
};

const applyUploadedVideo = async (target, videoFile, body = {}, oldPublicId = "") => {
  if (videoFile) {
    const uploaded = await uploadVideo(videoFile.path);
    ensureUploadResult(uploaded, "video upload");

    // Logging requirement: Cloudinary upload success
    console.log("☁️ ✅ [Cloudinary] uploadVideo success:", {
      url: uploaded.url,
      publicId: uploaded.publicId,
    });

    target.videoUrl = uploaded.url;
    target.videoPublicId = uploaded.publicId;

    if (oldPublicId && oldPublicId !== uploaded.publicId) {
      await deleteFromCloudinary(oldPublicId, "video");
    }
    return true;
  }

  if (body.videoUrl !== undefined && body.videoUrl !== "") {
    requireValidRemoteVideo(body.videoUrl);
    target.videoUrl = body.videoUrl;
    target.videoPublicId = body.videoPublicId || "";
    return true;
  }

  return false;
};


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

const buildCoursePayload = async (body, files = {}, currentCourse = null) => {
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
    "thumbnailPublicId",
    "videoUrl",
    "videoPublicId",
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

  if (payload.videoUrl !== undefined) {
    requireValidRemoteVideo(payload.videoUrl);
  }

  const thumbnailFile = files?.thumbnail?.[0];
  if (thumbnailFile) {
    const uploaded = await uploadThumbnail(thumbnailFile.path);
    ensureUploadResult(uploaded, "thumbnail upload");
    payload.thumbnail = uploaded.url;
    payload.thumbnailPublicId = uploaded.publicId;

    if (currentCourse?.thumbnailPublicId) {
      await deleteFromCloudinary(currentCourse.thumbnailPublicId, "image");
    }
  }

  const videoFile = files?.video?.[0];
  if (videoFile) {
    const uploaded = await uploadVideo(videoFile.path);
    ensureUploadResult(uploaded, "video upload");
    payload.videoUrl = uploaded.url;
    payload.videoPublicId = uploaded.publicId;

    if (currentCourse?.videoPublicId) {
      await deleteFromCloudinary(currentCourse.videoPublicId, "video");
    }
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
    const payload = await buildCoursePayload(req.body, req.files);
    const course = await Course.create({
      ...payload,
      teacher: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { teachingCourses: course._id },
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    Object.assign(course, await buildCoursePayload(req.body, req.files, course));
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
    if (!req.body.title?.trim()) {
      return res.status(400).json({ success: false, message: "Lecture title is required." });
    }

    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const section = course.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: "Section not found." });

    const videoFile = req.files?.video?.[0];
    if (!videoFile && (!req.body.videoUrl || req.body.videoUrl === "")) {
      return res.status(400).json({ success: false, message: "Lecture video is required." });
    }

    const lectureData = {
      title: req.body.title.trim(),
      description: req.body.description || "",
      isFree: req.body.isFree === true || req.body.isFree === "true",
      order: section.lectures.length,
    };

    // Upload/resolve video first. This is the most failure-prone part.
    const hasVideo = await applyUploadedVideo(lectureData, videoFile, req.body);
    if (!hasVideo) {
      return res.status(400).json({ success: false, message: "Lecture video is required." });
    }

    // Logging requirements
    // 1) Cloudinary upload success is logged inside upload service (if configured)
    // 2) Confirm Cloudinary fields on lectureData
    console.log("✅ [addLecture] Cloudinary fields resolved:", {
      videoUrl: lectureData.videoUrl,
      videoPublicId: lectureData.videoPublicId,
    });

    // 3) Enforce: never store local paths and only http(s) URLs
    if (lectureData.videoUrl && /^\/?uploads\//i.test(lectureData.videoUrl)) {
      return res.status(400).json({ success: false, message: "Local video path detected; reject." });
    }
    if (lectureData.videoUrl && !/^https?:\/\//i.test(lectureData.videoUrl)) {
      return res.status(400).json({ success: false, message: "Non-http videoUrl detected; reject." });
    }

    section.lectures.push(lectureData);
    course.totalLectures = course.sections.reduce((acc, s) => acc + s.lectures.length, 0);

    await course.save();

    // Post-save confirmation (MongoDB stored lecture fields)
    const savedSection = course.sections.id(req.params.sectionId);
    const savedLecture = savedSection?.lectures?.[savedSection.lectures.length - 1];
    console.log("📌 [addLecture] videoUrl saved in MongoDB:", {
      videoUrl: savedLecture?.videoUrl,
      videoPublicId: savedLecture?.videoPublicId,
    });

    // Ensure API response contains videoUrl
    console.log("📤 [addLecture] API response includes videoUrl:", {
      videoUrl: course?.sections?.find((s) => s._id?.toString() === req.params.sectionId)?.lectures?.slice(-1)?.[0]?.videoUrl,
    });

    res.json({ success: true, course });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
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
    if (req.body.isFree !== undefined) lectureFound.isFree = req.body.isFree === true || req.body.isFree === "true";

    const before = {
      videoUrl: lectureFound.videoUrl,
      videoPublicId: lectureFound.videoPublicId,
    };

    const videoFile = req.files?.video?.[0];
    await applyUploadedVideo(lectureFound, videoFile, req.body, lectureFound.videoPublicId);

    // Logging requirement
    console.log("📌 [updateLecture] video fields updated:", {
      before,
      after: {
        videoUrl: lectureFound.videoUrl,
        videoPublicId: lectureFound.videoPublicId,
      },
    });

    await course.save();

    console.log("📤 [updateLecture] API response contains videoUrl:", {
      videoUrl: lectureFound.videoUrl,
    });

    res.json({ success: true, course });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, teacher: req.user._id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    let deletedLecture = null;
    course.sections.forEach((section) => {
      const lecture = section.lectures.id(req.params.lectureId);
      if (lecture) deletedLecture = lecture;
      section.lectures = section.lectures.filter((l) => l._id.toString() !== req.params.lectureId);
    });

    if (!deletedLecture) {
      return res.status(404).json({ success: false, message: "Lecture not found." });
    }

    if (deletedLecture.videoPublicId) {
      await deleteFromCloudinary(deletedLecture.videoPublicId, "video");
    }

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
