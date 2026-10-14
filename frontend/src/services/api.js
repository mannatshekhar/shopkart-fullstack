import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerCustomer = (payload) => api.post("/customers/register", payload);

export const loginCustomer = (payload) => api.post("/customers/login", payload);

export const getCurrentCustomer = () => api.get("/customers/me");

export const logoutCustomer = () => api.post("/customers/logout");

export const getProducts = (params) => api.get("/products", { params });

export const getProductById = (id) => api.get(`/products/${id}`);
export const getWishlist = () => api.get("/wishlist");

export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const getCart = () => api.get("/cart");

export const addToCart = (productId) => api.post(`/cart/${productId}`);

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);
export const createPaymentOrder = (shippingAddress) =>
  api.post("/api/orders/create-payment-order", { shippingAddress });

export const verifyPayment = (payload) =>
  api.post("/api/orders/verify-payment", payload);

export const getMyOrders = () => api.get("/api/orders");

export const getOrderById = (id) => api.get(`/api/orders/${id}`);


export default api;
