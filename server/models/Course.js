const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  videoPublicId: String,
  duration: Number, // in seconds
  order: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  resources: [
    {
      name: String,
      url: String,
      type: { type: String, enum: ["pdf", "doc", "link", "zip"] },
    },
  ],
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    shortDescription: {
      type: String,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    thumbnail: {
      type: String,
      default: "",
    },
    thumbnailPublicId: {
      type: String,
      default: "",
    },
    previewVideo: String,
    videoUrl: String,
    videoPublicId: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Web Development",
        "Mobile App Development",
        "Data Science",
        "Artificial Intelligence (AI)",
        "Machine Learning",
        "Cyber Security",
        "Cloud Computing",
        "DevOps",
        "Database Management",
        "Software Testing",
        "Game Development",
        "Computer Science",
        "Mathematics",
        "Science",
        "Commerce",
        "Engineering",
        "Digital Marketing",
        "Graphic Design",
        "UI/UX Design",
        "Video Editing",
        "Photography",
        "English Language",
        "Communication Skills",
        "Personality Development",
        "Business & Entrepreneurship",
        "Finance & Accounting",
        "Stock Market & Trading",
        "Competitive Exam Preparation",
        "School Education",
        "Health & Fitness",
        "Music",
        "Cooking",
        "Content Writing",
        "Career Development",
        "Interview Preparation",
        "Freelancing",
        "E-Commerce",
        "Networking",
        "Languages",
        "Python",
        "Java",
        "Data Structures & Algorithms",
        "Full Stack Development",
        "Other",
      ],
    },
    tags: [String],
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "All Levels",
    },
    language: {
      type: String,
      enum: ["English", "Gujarati", "Hindi", "Both"],
      default: "English",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    subscriptionDuration: {
      type: Number, // in days
      default: 30,
    },
    sections: [sectionSchema],
    totalDuration: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
    offlineLecturesTaken: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    requirements: [String],
    learningOutcomes: [String],
    targetAudience: [String],
  },
  { timestamps: true }
);

// Auto-generate slug from title
courseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") + "-" + Date.now();
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);
