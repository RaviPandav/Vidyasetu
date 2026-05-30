const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Generate a signed JWT access token
 */
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Generate a signed JWT refresh token
 */
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

/**
 * Generate a secure random token (for email verification, password reset)
 * @returns {{ raw: string, hashed: string }}
 */
const generateSecureToken = () => {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
};

/**
 * Hash an existing token string
 */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Verify a JWT token
 * @param {string} token
 * @param {string} secret
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  hashToken,
  verifyToken,
};
