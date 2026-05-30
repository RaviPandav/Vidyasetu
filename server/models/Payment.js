const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },
    gatewayPaymentId: String,
    gatewayOrderId: String,
    gatewaySignature: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    invoiceId: String,
    isSubscription: { type: Boolean, default: false },
    subscriptionEndDate: Date,
  },
  { timestamps: true }
);

// Auto-generate invoice ID
paymentSchema.pre("save", function (next) {
  if (!this.invoiceId) {
    this.invoiceId = `VS-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
