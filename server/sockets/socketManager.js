const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name role avatar");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join personal room for targeted notifications
    socket.join(`user:${socket.user._id}`);

    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // ── Chat ─────────────────────────────────────────────
    socket.on("join_chat", ({ roomId }) => {
      socket.join(`chat:${roomId}`);
    });

    socket.on("send_message", ({ roomId, message }) => {
      io.to(`chat:${roomId}`).emit("receive_message", {
        from: { id: socket.user._id, name: socket.user.name, avatar: socket.user.avatar },
        message,
        timestamp: new Date(),
      });
    });

    // ── Live Class ────────────────────────────────────────
    socket.on("join_live_class", ({ classId }) => {
      socket.join(`live:${classId}`);
      socket.to(`live:${classId}`).emit("participant_joined", {
        user: { id: socket.user._id, name: socket.user.name },
      });
    });

    socket.on("leave_live_class", ({ classId }) => {
      socket.leave(`live:${classId}`);
      socket.to(`live:${classId}`).emit("participant_left", {
        userId: socket.user._id,
      });
    });

    // ── Typing indicator ──────────────────────────────────
    socket.on("typing", ({ roomId }) => {
      socket.to(`chat:${roomId}`).emit("user_typing", { user: socket.user.name });
    });

    socket.on("stop_typing", ({ roomId }) => {
      socket.to(`chat:${roomId}`).emit("user_stop_typing", { user: socket.user.name });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };
