const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    courseInterest: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "closed"],
      default: "new",
    },
    notes: { type: String, default: "" }, // admin internal notes
    source: { type: String, default: "contact_form" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
