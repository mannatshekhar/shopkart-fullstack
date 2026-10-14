import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateQuantity,
  removeFromCart as apiRemoveFromCart,
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getCart();
      setCartItems(res.data.cart);
    } catch (err) {
      if (err.response?.status === 401) {
        setCartItems([]);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const runMutation = async (productId, apiCall) => {
    setBusyId(productId);
    try {
      const res = await apiCall();
      setCartItems(res.data.cart);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || "Something went wrong. Please try again.",
      };
    } finally {
      setBusyId(null);
    }
  };

  const addToCart = (productId) => runMutation(productId, () => apiAddToCart(productId));
  const updateQuantity = (productId, quantity) =>
    runMutation(productId, () => apiUpdateQuantity(productId, quantity));
  const removeFromCart = (productId) =>
    runMutation(productId, () => apiRemoveFromCart(productId));

  // Used after a verified payment: the backend already emptied the cart, so mirror that here
  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const value = {
    cartItems,
    loading,
    error,
    busyId,
    totalItems,
    subtotal,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}