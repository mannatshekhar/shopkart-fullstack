const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

const addToWishlist = async (req, res, next) => {
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

    if (customer.wishlist.some((id) => id.toString() === productId)) {
      return res.status(409).json({ success: false, message: "Product already in wishlist." });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const customer = await Customer.findById(req.user._id);

    const index = customer.wishlist.findIndex((id) => id.toString() === productId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Product not in wishlist." });
    }

    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };