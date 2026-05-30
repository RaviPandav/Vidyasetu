const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Payment = require("../../models/Payment");
const Course = require("../../models/Course");
const User = require("../../models/User");

const getRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return {
    baseURL: "https://api.razorpay.com/v1",
    auth: {
      username: process.env.RAZORPAY_KEY_ID,
      password: process.env.RAZORPAY_KEY_SECRET,
    },
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  };
};

const getCourseAmount = (course) => {
  const amount = course.discountPrice > 0 ? course.discountPrice : course.price;
  return Math.round(Number(amount || 0) * 100);
};

const getGatewayError = (error) => {
  const gatewayError = error.response?.data?.error;
  return {
    statusCode: error.response?.status,
    message: gatewayError?.description || error.message || "Payment gateway request failed.",
  };
};

const getGatewayResponseStatus = (gatewayStatusCode) => (
  gatewayStatusCode === 400 ? 400 : 502
);

const createRazorpayOrder = async (payload) => {
  const { data } = await axios.post("/orders", payload, getRazorpayConfig());
  return data;
};

const fetchRazorpayPayment = async (paymentId) => {
  const { data } = await axios.get(`/payments/${paymentId}`, getRazorpayConfig());
  return data;
};

const captureRazorpayPayment = async (paymentId, amount, currency) => {
  const { data } = await axios.post(
    `/payments/${paymentId}/capture`,
    { amount, currency },
    getRazorpayConfig()
  );
  return data;
};

// POST /api/student/payment/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    const razorpayConfig = getRazorpayConfig();
    if (!razorpayConfig) {
      return res.status(500).json({ success: false, message: "Payment gateway is not configured." });
    }

    const student = await User.findById(req.user._id);
    const alreadyEnrolled = student.enrolledCourses.some((e) => e.course.toString() === courseId);
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "Already enrolled." });
    }

    const amount = getCourseAmount(course);
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "This course is free. Enroll directly." });
    }

    let order;
    try {
      order = await createRazorpayOrder({
        amount,
        currency: "INR",
        receipt: `vs_${Date.now()}`,
        notes: { courseId: courseId, studentId: req.user._id.toString() },
      });
    } catch (error) {
      const gatewayError = getGatewayError(error);
      return res
        .status(getGatewayResponseStatus(gatewayError.statusCode))
        .json({ success: false, message: gatewayError.message });
    }

    // Create pending payment record
    await Payment.create({
      student: req.user._id,
      course: courseId,
      amount: amount / 100,
      currency: "INR",
      gateway: "razorpay",
      gatewayOrderId: order.id,
      status: "pending",
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      courseName: course.title,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to create payment order." });
  }
};

// POST /api/student/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ success: false, message: "Payment details are incomplete." });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    const razorpayConfig = getRazorpayConfig();
    if (!razorpayConfig) {
      return res.status(500).json({ success: false, message: "Payment gateway is not configured." });
    }

    const payment = await Payment.findOne({
      gatewayOrderId: razorpay_order_id,
      student: req.user._id,
      course: courseId,
      status: "pending",
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Pending payment not found." });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      payment.status = "failed";
      await payment.save({ validateBeforeSave: false });
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const expectedAmount = getCourseAmount(course);
    let razorpayPayment;
    try {
      razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id);
    } catch (error) {
      const gatewayError = getGatewayError(error);
      return res
        .status(getGatewayResponseStatus(gatewayError.statusCode))
        .json({ success: false, message: gatewayError.message });
    }
    const isMatchingPayment =
      razorpayPayment.order_id === razorpay_order_id &&
      razorpayPayment.amount === expectedAmount &&
      razorpayPayment.currency === payment.currency;

    if (!isMatchingPayment) {
      payment.status = "failed";
      await payment.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: "Payment details do not match this course." });
    }

    if (razorpayPayment.status === "authorized") {
      try {
        await captureRazorpayPayment(razorpay_payment_id, expectedAmount, payment.currency);
      } catch (error) {
        const gatewayError = getGatewayError(error);
        return res
          .status(getGatewayResponseStatus(gatewayError.statusCode))
          .json({ success: false, message: gatewayError.message });
      }
    } else if (razorpayPayment.status !== "captured") {
      payment.status = "failed";
      await payment.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: "Payment is not completed." });
    }

    // Update payment status
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.gatewaySignature = razorpay_signature;
    payment.amount = expectedAmount / 100;
    payment.status = "completed";
    await payment.save({ validateBeforeSave: false });

    // Enroll student
    const student = await User.findById(req.user._id);
    const alreadyEnrolled = student.enrolledCourses.some(
      (e) => e.course.toString() === courseId
    );
    if (!alreadyEnrolled) {
      student.enrolledCourses.push({ course: courseId });
      await student.save({ validateBeforeSave: false });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    }

    res.json({ success: true, message: "Payment successful! You are now enrolled.", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to verify payment." });
  }
};

module.exports = { createPaymentOrder, verifyPayment };
