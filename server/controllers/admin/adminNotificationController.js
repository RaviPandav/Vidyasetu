const Notification = require("../../models/Notification");
const User = require("../../models/User");

// POST /api/admin/notifications/send
const sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole, userIds, link } = req.body;

    let recipients = [];
    if (userIds && userIds.length > 0) {
      recipients = userIds;
    } else if (targetRole) {
      const users = await User.find({ role: targetRole, isActive: true }).select("_id");
      recipients = users.map((u) => u._id);
    }

    const notifications = recipients.map((userId) => ({
      recipient: userId,
      sender: req.user._id,
      type: type || "announcement",
      title,
      message,
      link,
    }));

    await Notification.insertMany(notifications);

    // Emit socket event for real-time delivery
    const { getIO } = require("../../sockets/socketManager");
    const io = getIO();
    recipients.forEach((userId) => {
      io.to(`user:${userId}`).emit("notification", { title, message, type, link });
    });

    res.json({ success: true, message: `Notification sent to ${recipients.length} users.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendNotification };
