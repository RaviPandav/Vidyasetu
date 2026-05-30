const Notification = require("../../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyNotifications, markNotificationRead };
