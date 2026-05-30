const Doubt = require("../../models/Doubt");

const createDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.create({ ...req.body, student: req.user._id });
    res.status(201).json({ success: true, doubt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.user._id })
      .populate("course", "title")
      .populate("answers.author", "name avatar role")
      .sort({ createdAt: -1 });
    res.json({ success: true, doubts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upvoteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found." });

    const idx = doubt.upvotes.indexOf(req.user._id);
    if (idx === -1) {
      doubt.upvotes.push(req.user._id);
    } else {
      doubt.upvotes.splice(idx, 1);
    }
    await doubt.save();
    res.json({ success: true, upvotes: doubt.upvotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createDoubt, getMyDoubts, upvoteDoubt };
