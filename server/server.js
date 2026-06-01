/**
 * VidyaSetu - Bridge of Knowledge
 * Main Server Entry Point
 */

const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const { corsOptions } = require("./config/corsOptions");
const { initSocket } = require("./sockets/socketManager");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/public/authRoutes");
const publicRoutes = require("./routes/public/publicRoutes");
const chatRoutes = require("./routes/public/chatRoutes");
const reviewRoutes = require("./routes/public/reviewRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const teacherRoutes = require("./routes/teacher/teacherRoutes");
const studentRoutes = require("./routes/student/studentRoutes");

// Connect to MongoDB
connectDB();

const app = express();
const Port = process.env.PORT || 4000;
const server = http.createServer(app);
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ── Socket.io Init ──────────────────────────────────────
initSocket(server);

// ── Security Middleware ─────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());

app.use(cors(corsOptions));

// ── Rate Limiting ───────────────────────────────────────
const parseEnvNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const authLimiter = rateLimit({
  windowMs: parseEnvNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parseEnvNumber(process.env.AUTH_RATE_LIMIT_MAX, 20),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
});

const apiLimiter = rateLimit({
  windowMs: parseEnvNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parseEnvNumber(process.env.RATE_LIMIT_MAX, 300),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ["GET", "HEAD", "OPTIONS"].includes(req.method),
  message: { success: false, message: "Too many requests, please try again later." },
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ── Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logger ──────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Static Files ────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth/me", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(["/api/student", "/api/teacher", "/api/admin"], (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ── Health Check ────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VidyaSetu API is running 🎓",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

// ── 404 / SPA Fallback ────────────────────────────────────
const clientDistPath = path.join(__dirname, "../client/dist");

if (process.env.NODE_ENV === "production") {
  // Serve static client build
  app.use(express.static(clientDistPath));

  // Return index.html for all non-API routes (SPA fallback)
  app.get("*", (req, res) => {
    if (req.originalUrl.startsWith("/api")) {
      res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
      return;
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  // Development / API-only fallback
  app.use("*", (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  });
}

// ── Global Error Handler ────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   🎓 VidyaSetu API Running         ║
  ║   Port    : ${PORT}                  ║
  ║   Mode    : ${process.env.NODE_ENV}          ║
  ╚════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
