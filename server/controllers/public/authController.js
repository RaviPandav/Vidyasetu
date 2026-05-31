const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dns = require("dns").promises;
const User = require("../../models/User");
const emailService = require("../../services/emailService");

// ── Helper: generate JWT ──────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const shouldEnforceEmailVerification =
  process.env.ENFORCE_EMAIL_VERIFICATION === "true";
  
const disposableEmailDomains = new Set([
  "10minutemail.com",
  "20minutemail.com",
  "anonaddy.com",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "guerrillamail.com",
  "maildrop.cc",
  "mailinator.com",
  "moakt.com",
  "sharklasers.com",
  "temp-mail.org",
  "tempmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
]);

const trustedEmailDomains = new Set([
  "aol.com",
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "mail.com",
  "msn.com",
  "outlook.com",
  "proton.me",
  "protonmail.com",
  "rediffmail.com",
  "yahoo.co.in",
  "yahoo.com",
  "yandex.com",
  "zoho.com",
  "zohomail.com",
]);

const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const emailDnsTimeoutMs = 5000;

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const validateRealEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!emailFormatRegex.test(normalizedEmail)) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  const domain = normalizedEmail.split("@")[1];
  if (!domain || disposableEmailDomains.has(domain)) {
    return { valid: false, message: "Temporary or fake email addresses are not allowed." };
  }

  if (trustedEmailDomains.has(domain)) {
    return { valid: true, email: normalizedEmail };
  }

  try {
    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Email domain lookup timed out")), emailDnsTimeoutMs)),
    ]);
    if (!mxRecords.length) {
      return { valid: false, message: "Please use a real email address that can receive mail." };
    }
  } catch (error) {
    return { valid: false, message: "Please use a real email address that can receive mail." };
  }

  return { valid: true, email: normalizedEmail };
};


// ── @route  POST /api/auth/register ──────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const emailValidation = await validateRealEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot register as admin.",
      });
    }

    const existingUser = await User.findOne({
      email: emailValidation.email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email: emailValidation.email,
      password,
      role: role || "student",
      phone,
      isEmailVerified: true, // auto verify

      emailVerificationToken: crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex"),

      emailVerificationExpires:
        Date.now() + 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── @route  POST /api/auth/login ─────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!emailFormatRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated. Contact admin." });
    }

    if (shouldEnforceEmailVerification && !user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @route  GET /api/auth/verify-email/:token ────────────
const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token." });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ success: true, message: "Email verified successfully!", token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @route  POST /api/auth/forgot-password ───────────────
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account with that email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const emailResult = await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({
      success: true,
      message:
        emailResult?.skipped && process.env.NODE_ENV !== "production"
          ? "Password reset link generated for development."
          : "Password reset link sent to your email.",
      ...(process.env.NODE_ENV !== "production" && { resetUrl }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @route  POST /api/auth/reset-password/:token ─────────
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. Please login." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @route  GET /api/auth/me ─────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses.course", "title thumbnail");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe };
