/**
 * VidyaSetu Database Seeder
 * Run: node server/utils/seeder.js
 *
 * Seeds: Admin user, sample teachers, sample courses
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Course = require("../models/Course");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
};

const seedAdmin = async () => {
  const existing = await User.findOne({ email: "admin@vidyasetu.com" });
  if (existing) {
    console.log("⚠️  Admin already exists — skipping");
    return existing;
  }
  const admin = await User.create({
    name: "Super Admin",
    email: "admin@vidyasetu.com",
    password: "Admin@123",
    role: "admin",
    isEmailVerified: true,
    isActive: true,
  });
  console.log("✅ Admin created: admin@vidyasetu.com / Admin@123");
  return admin;
};

const seedTeacher = async () => {
  const existing = await User.findOne({ email: "teacher@vidyasetu.com" });
  if (existing) {
    console.log("⚠️  Demo teacher already exists — skipping");
    return existing;
  }
  const teacher = await User.create({
    name: "Rajan Mehta",
    email: "teacher@vidyasetu.com",
    password: "Teacher@123",
    role: "teacher",
    isEmailVerified: true,
    isActive: true,
    bio: "10+ years of experience teaching Mathematics and Science. IIT Graduate.",
    expertise: ["Mathematics", "Physics", "JEE Preparation"],
    qualifications: ["B.Tech IIT Bombay", "M.Sc Mathematics"],
  });
  console.log("✅ Teacher created: teacher@vidyasetu.com / Teacher@123");
  return teacher;
};

const seedStudent = async () => {
  const existing = await User.findOne({ email: "student@vidyasetu.com" });
  if (existing) {
    console.log("⚠️  Demo student already exists — skipping");
    return existing;
  }
  const student = await User.create({
    name: "Priya Patel",
    email: "student@vidyasetu.com",
    password: "Student@123",
    role: "student",
    isEmailVerified: true,
    isActive: true,
    phone: "+91 9558453510",
  });
  console.log("✅ Student created: student@vidyasetu.com / Student@123");
  return student;
};

const seedCourse = async (teacherId) => {
  const existing = await Course.findOne({ title: "Complete Mathematics for Class 12" });
  if (existing) {
    console.log("⚠️  Demo course already exists — skipping");
    return existing;
  }
  const course = await Course.create({
    title: "Complete Mathematics for Class 12",
    description:
      "Master Class 12 Mathematics with comprehensive video lectures, practice tests, and doubt support. Covers all chapters as per CBSE syllabus.",
    shortDescription: "Complete CBSE Class 12 Mathematics with expert guidance",
    teacher: teacherId,
    category: "Mathematics",
    level: "Intermediate",
    language: "English",
    price: 2999,
    discountPrice: 1999,
    isPublished: true,
    isApproved: true,
    requirements: [
      "Basic knowledge of Class 11 Mathematics",
      "Notebook and pen for practice",
    ],
    learningOutcomes: [
      "Master all Class 12 Math chapters",
      "Solve complex integration problems",
      "Prepare for board and competitive exams",
      "Understand 3D geometry and vectors",
    ],
    targetAudience: ["Class 12 students", "JEE/NEET aspirants"],
    sections: [
      {
        title: "Chapter 1: Relations and Functions",
        order: 0,
        lectures: [
          {
            title: "Introduction to Relations",
            description: "Understanding types of relations with examples",
            isFree: true,
            duration: 1800,
            order: 0,
          },
          {
            title: "Types of Functions",
            description: "One-one, onto, bijective functions explained",
            isFree: false,
            duration: 2400,
            order: 1,
          },
        ],
      },
      {
        title: "Chapter 2: Inverse Trigonometric Functions",
        order: 1,
        lectures: [
          {
            title: "Domain and Range of Inverse Trig Functions",
            isFree: false,
            duration: 2100,
            order: 0,
          },
        ],
      },
    ],
    totalLectures: 3,
  });
  console.log("✅ Sample course created");
  return course;
};

const run = async () => {
  try {
    await connectDB();
    const admin = await seedAdmin();
    const teacher = await seedTeacher();
    const student = await seedStudent();
    const course = await seedCourse(teacher._id);

    // Enroll demo student in demo course
    const studentDoc = await User.findById(student._id);
    const alreadyEnrolled = studentDoc.enrolledCourses.some(
      (e) => e.course.toString() === course._id.toString()
    );
    if (!alreadyEnrolled) {
      studentDoc.enrolledCourses.push({ course: course._id, progress: 33 });
      await studentDoc.save({ validateBeforeSave: false });
      console.log("✅ Student enrolled in demo course");
    }

    console.log("\n🎉 Seeding complete!\n");
    console.log("────────────────────────────────");
    console.log("Login credentials:");
    console.log("  Admin:   admin@vidyasetu.com   / Admin@123");
    console.log("  Teacher: teacher@vidyasetu.com / Teacher@123");
    console.log("  Student: student@vidyasetu.com / Student@123");
    console.log("────────────────────────────────\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder error:", err.message);
    process.exit(1);
  }
};

run();
