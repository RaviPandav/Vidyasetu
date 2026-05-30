const Inquiry = require("../../models/Inquiry");

const getInquiries = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status) query.status = status;

    if (search) {
      const s = String(search).trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
        { subject: { $regex: s, $options: "i" } },
        { message: { $regex: s, $options: "i" } },
      ];
    }

    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Number.parseInt(limit, 10) || 15);

    const [items, total] = await Promise.all([
      Inquiry.find(query)
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .select("name email phone subject message courseInterest status createdAt")
        .lean(),
      Inquiry.countDocuments(query),
    ]);

    res.json({
      success: true,
      inquiries: items,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit) || 1,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInquiries };

