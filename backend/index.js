require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/customers", customerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/api/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/api/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "ShopKart auth service is running." });
});

app.get("*", (req, res, next) => {
  if (
    req.path.startsWith("/customers") ||
    req.path.startsWith("/products") ||
    req.path.startsWith("/api")
  ) {
    return next();
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/customers", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use("/products", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your .env file.");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined. Check your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`ShopKart auth server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();

module.exports = app;
