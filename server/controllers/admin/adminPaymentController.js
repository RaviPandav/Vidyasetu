const Payment = require("../../models/Payment");

// GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const { status, gateway, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (gateway) query.gateway = gateway;

    const payments = await Payment.find(query)
      .populate("student", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);
    res.json({ success: true, payments, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/payments/stats
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const byGateway = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$gateway",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({ success: true, stats, byGateway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllPayments, getPaymentStats };
