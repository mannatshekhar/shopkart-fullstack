const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

const PRODUCT_FIELDS = "name price category image stock";

// Load the logged-in customer's cart with full product details
const loadCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: PRODUCT_FIELDS,
  });
  // skip items whose product was deleted from the database
  return customer.cart.filter((item) => item.product);
};

const addToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = customer.cart.find((item) => item.product.toString() === productId);
    const newQuantity = existing ? existing.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available.`,
      });
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }
    await customer.save();

    const cart = await loadCart(req.user._id);
    return res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await loadCart(req.user._id);
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number of at least 1.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Product not in cart." });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available.`,
      });
    }

    item.quantity = quantity;
    await customer.save();

    const cart = await loadCart(req.user._id);
    return res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const customer = await Customer.findById(req.user._id);
    const exists = customer.cart.some((i) => i.product.toString() === productId);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not in cart." });
    }

    customer.cart = customer.cart.filter((i) => i.product.toString() !== productId);
    await customer.save();

    const cart = await loadCart(req.user._id);
    return res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart };