const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../../controllers/public/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
