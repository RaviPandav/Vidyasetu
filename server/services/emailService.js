const nodemailer = require("nodemailer");

const getEnv = (key) => (process.env[key] || "").trim();
const isDevelopment = process.env.NODE_ENV !== "production";

const emailConfig = {
  host: getEnv("EMAIL_HOST"),
  port: parseInt(getEnv("EMAIL_PORT"), 10) || 587,
  user: getEnv("EMAIL_USER"),
  pass: getEnv("EMAIL_PASS"),
  from: getEnv("EMAIL_FROM"),
};

const hasEmailConfig =
  emailConfig.host && emailConfig.port && emailConfig.user && emailConfig.pass && emailConfig.from;

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

const deliverEmail = async ({ to, subject, html }) => {
  if (!hasEmailConfig) {
    if (isDevelopment) {
      console.warn(`Email delivery skipped in development for ${to}: missing email configuration.`);
      return { skipped: true };
    }

    throw new Error("Email service is not configured.");
  }

  try {
    return await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html,
    });
  } catch (error) {
    if (isDevelopment) {
      console.warn(`Email delivery failed in development for ${to}: ${error.message}`);
      return { skipped: true, error: error.message };
    }

    throw error; }
};

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6C63FF 0%, #4CAF50 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; }
    .body { padding: 40px 32px; color: #333; line-height: 1.7; }
    .btn { display: inline-block; padding: 14px 32px; background: #6C63FF; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; color: #999; font-size: 13px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 VidyaSetu</h1>
      <p>Bridge of Knowledge</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} VidyaSetu. All rights reserved.<br>
      If you did not request this email, please ignore it.
    </div>
  </div>
</body>
</html>
`;

const sendVerificationEmail = async (email, name, verifyUrl) => {
  const content = `
    <h2>Welcome to VidyaSetu, ${name}! 🎉</h2>
    <p>Thank you for registering. Please verify your email address to get started.</p>
    <a href="${verifyUrl}" class="btn">Verify My Email</a>
    <p style="color:#888;font-size:13px;">This link expires in 24 hours.</p>
  `;
  return deliverEmail({
    to: email,
    subject: "Verify your VidyaSetu account",
    html: emailTemplate(content),
  });
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, please ignore.</p>
  `;
  return deliverEmail({
    to: email,
    subject: "VidyaSetu - Password Reset Request",
    html: emailTemplate(content),
  });
};

const sendEnrollmentConfirmation = async (email, name, courseName) => {
  const content = `
    <h2>Enrollment Confirmed! 🎓</h2>
    <p>Hi ${name}, you have successfully enrolled in <strong>${courseName}</strong>.</p>
    <p>Start learning now and track your progress in your dashboard.</p>
    <a href="${process.env.CLIENT_URL}/student/dashboard" class="btn">Go to Dashboard</a>
  `;
  return deliverEmail({
    to: email,
    subject: `Enrolled in ${courseName} - VidyaSetu`,
    html: emailTemplate(content),
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendEnrollmentConfirmation };
