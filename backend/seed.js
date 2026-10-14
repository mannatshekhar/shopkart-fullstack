require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const sampleProducts = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600",
    stock: 10,
  },
  {
    name: "Smartphone Stand",
    description: "Adjustable aluminum stand for phones and tablets.",
    price: 599,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600",
    stock: 0,
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket with a relaxed fit.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    stock: 15,
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with breathable mesh.",
    price: 2799,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    stock: 40,
  },
  {
    name: "The Midnight Library",
    description: "A novel about all the choices that go into a life well lived.",
    price: 399,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600",
    stock: 60,
  },
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 handcrafted ceramic mugs.",
    price: 899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
    stock: 30,
  },
  {
    name: "Table Lamp",
    description: "Minimalist wooden table lamp with warm lighting.",
    price: 1499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
    stock: 12,
  },
];

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    await Product.deleteMany({});
    console.log("Cleared existing products.");

    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${inserted.length} sample products.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
