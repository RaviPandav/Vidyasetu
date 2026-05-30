const User = require("../../models/User");
const Course = require("../../models/Course");
const Payment = require("../../models/Payment");

const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const student = await User.findById(req.user._id);
    const alreadyEnrolled = student.enrolledCourses.some(
      (e) => e.course.toString() === req.params.courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "Already enrolled." });
    }

    const courseAmount = course.discountPrice > 0 ? course.discountPrice : course.price;
    if (courseAmount > 0) {
      return res.status(402).json({ success: false, message: "Payment is required for this course." });
    }

    student.enrolledCourses.push({ course: req.params.courseId });
    await student.save({ validateBeforeSave: false });

    course.enrollmentCount += 1;
    await course.save();

    res.json({ success: true, message: "Enrolled successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate({
        path: "enrolledCourses.course",
        select: "title thumbnail teacher category totalLectures rating",
        populate: { path: "teacher", select: "name avatar" },
      })
      .lean();
    res.json({ success: true, courses: student.enrolledCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseContent = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const isEnrolled = student.enrolledCourses.some(
      (e) => e.course.toString() === req.params.id
    );
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course." });
    }

    const course = await Course.findById(req.params.id)
      .populate("teacher", "name avatar bio")
      .lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLectureProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const student = await User.findById(req.user._id);
    const enrollment = student.enrolledCourses.find(
      (e) => e.course.toString() === req.params.id
    );
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "Not enrolled." });
    }
    enrollment.progress = Math.min(100, Math.max(0, progress));
    await student.save({ validateBeforeSave: false });
    res.json({ success: true, progress: enrollment.progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { enrollCourse, getEnrolledCourses, getCourseContent, updateLectureProgress };
