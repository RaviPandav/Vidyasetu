const express = require("express");
const router = express.Router();
const { protect } = require("../../middleware/auth");
const ChatMessage = require("../../models/ChatMessage");

// GET /api/chat/:roomId/messages — fetch last 50 messages for a room
router.get("/:roomId/messages", protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ roomId, isDeleted: false })
      .populate("sender", "name avatar role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Return in chronological order
    messages.reverse();

    const total = await ChatMessage.countDocuments({ roomId, isDeleted: false });

    res.json({
      success: true,
      messages,
      hasMore: total > page * limit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat/:roomId/messages — save a message (called from Socket handler or REST)
router.post("/:roomId/messages", protect, async (req, res) => {
  try {
    const { content, type = "text", fileUrl } = req.body;
    const message = await ChatMessage.create({
      roomId: req.params.roomId,
      sender: req.user._id,
      content,
      type,
      fileUrl,
    });
    const populated = await message.populate("sender", "name avatar role");
    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/chat/messages/:id — soft delete own message
router.delete("/messages/:id", protect, async (req, res) => {
  try {
    const message = await ChatMessage.findOne({
      _id: req.params.id,
      sender: req.user._id,
    });
    if (!message) return res.status(404).json({ success: false, message: "Message not found." });
    message.isDeleted = true;
    await message.save();
    res.json({ success: true, message: "Message deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
