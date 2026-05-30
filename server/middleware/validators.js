const { body, param, query, validationResult } = require("express-validator");

/**
 * Run validation result and return 400 if errors found
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────
const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name too long"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["student", "teacher"]).withMessage("Invalid role"),
  validate,
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  validate,
];

const resetPasswordValidator = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  param("token").notEmpty().withMessage("Token is required"),
  validate,
];

// ── Course Validators ─────────────────────────────────────
const courseValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isNumeric().withMessage("Price must be a number").isFloat({ min: 0 }),
  body("category").notEmpty().withMessage("Category is required"),
  validate,
];

// ── Quiz Validators ───────────────────────────────────────
const quizValidator = [
  body("title").trim().notEmpty().withMessage("Quiz title is required"),
  body("duration").isInt({ min: 1 }).withMessage("Duration must be at least 1 minute"),
  body("questions").isArray({ min: 1 }).withMessage("At least one question required"),
  validate,
];

// ── Inquiry Validators ────────────────────────────────────
const inquiryValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("message").trim().notEmpty().withMessage("Message is required"),
  validate,
];

// ── Review Validators ─────────────────────────────────────
const reviewValidator = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
  body("comment").optional().isLength({ max: 1000 }),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  courseValidator,
  quizValidator,
  inquiryValidator,
  reviewValidator,
};
