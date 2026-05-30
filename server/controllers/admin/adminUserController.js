const User = require("../../models/User");
const Course = require("../../models/Course");
const Payment = require("../../models/Payment");

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalRevenue, recentUsers, recentPayments] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        Course.countDocuments({ isPublished: true }),
        Payment.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        User.find().sort({ createdAt: -1 }).limit(5).select("name email role avatar createdAt"),
        Payment.find({ status: "completed" })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("student", "name email")
          .populate("course", "title"),
      ]);

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "completed", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalTeachers,
          totalCourses,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        recentUsers,
        recentPayments,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("enrolledCourses.course", "title");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, bio },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}.`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getAllUsers, getUserById, updateUser, deleteUser, toggleUserStatus };
