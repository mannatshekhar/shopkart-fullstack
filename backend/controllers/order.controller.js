const mongoose = require("mongoose");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");

// Server-side check of the shipping form (never trust the client only)
const validateShipping = (a) => {
  if (!a || typeof a !== "object") return "Shipping address is required.";
  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const f of fields) {
    if (typeof a[f] !== "string" || !a[f].trim()) return `${f} is required.`;
  }
  if (!/^[6-9]\d{9}$/.test(a.phone.trim())) return "Phone must be a valid 10-digit number.";
  if (!/^\d{6}$/.test(a.pincode.trim())) return "Pincode must contain 6 digits.";
  return null;
};

// POST /orders/create-payment-order
const createPaymentOrder = async (req, res, next) => {
  try {
    // Only the shipping address is read from the body. Totals and prices are ignored.
    const { shippingAddress } = req.body;
    const shippingError = validateShipping(shippingAddress);
    if (shippingError) {
      return res.status(400).json({ success: false, message: shippingError });
    }

    // Load the cart with the LATEST product data
    const customer = await Customer.findById(req.user._id).populate("cart.product");
    if (!customer.cart.length) {
      return res.status(400).json({ success: false, message: "Your cart is empty." });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      // product deleted after it was added to the cart
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available.",
        });
      }

      // final stock verification
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      // snapshot: copy purchase-time data into the order
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      // total is calculated on the server
      totalAmount += product.price * cartItem.quantity;
    }

    const cleanAddress = {};
    for (const key of Object.keys(shippingAddress)) {
      if (["fullName", "phone", "addressLine1", "city", "state", "pincode"].includes(key)) {
        cleanAddress[key] = shippingAddress[key].trim();
      }
    }

    // Pending ShopKart order (cart is NOT cleared here)
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: cleanAddress,
      totalAmount,
    });

    // Razorpay order, amount in paise
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID, // Key ID is safe. The secret is never sent.
    });
  } catch (error) {
    next(error);
  }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res, next) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment details are missing." });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // already paid: just return it (safe if the request is repeated)
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({ success: true, order });
    }

    // the order id stored in OUR database is the trusted one
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // order stays PENDING and the cart is NOT cleared
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // signature is valid: confirm the order
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // only now clear the cart
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// GET /orders  (only paid orders of the logged-in user, newest first)
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id, paymentStatus: "PAID" }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// GET /orders/:id  (user must own the order)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findById(id);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };