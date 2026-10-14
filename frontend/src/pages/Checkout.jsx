import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

function validate(form) {
  const errors = {};
  const v = (k) => form[k].trim();

  if (!v("fullName")) errors.fullName = "Full name is required.";
  if (!v("phone")) errors.phone = "Phone number is required.";
  else if (!/^\d{10}$/.test(v("phone")))
    errors.phone = "Phone must be a valid 10-digit number.";
  if (!v("addressLine1")) errors.addressLine1 = "Address is required.";
  if (!v("city")) errors.city = "City is required.";
  if (!v("state")) errors.state = "State is required.";
  if (!v("pincode")) errors.pincode = "Pincode is required.";
  else if (!/^\d{6}$/.test(v("pincode")))
    errors.pincode = "Pincode must contain 6 digits.";

  return errors;
}

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Layout({ children }) {
  return (
    <div className="home">
      <Navbar />
      <main className="products-page">{children}</main>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, loading, clearCart } = useCart();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setServerError("");

    // 1. Client validation: no backend call if this fails
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // 2. Make sure the Razorpay script is available
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setServerError("Could not load Razorpay. Check your internet and try again.");
        setSubmitting(false);
        return;
      }

      // 3. Backend validates cart, stock and price, then creates both orders
      const shippingAddress = Object.fromEntries(
        Object.entries(form).map(([k, val]) => [k, val.trim()])
      );
      const res = await createPaymentOrder(shippingAddress);
      const data = res.data;

      // 4. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        // Not trusted by itself: the backend must verify the signature
        handler: async (response) => {
          try {
            await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart(); // only after the backend verified the signature
            navigate(`/orders/${data.shopKartOrderId}`, {
              state: { justPlaced: true },
            });
          } catch (err) {
            setServerError(
              err.response?.data?.message ||
                "Payment could not be verified. Your cart has not been cleared."
            );
            setSubmitting(false);
          }
        },

        modal: {
          ondismiss: () => setSubmitting(false),
        },

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", () => {
        setServerError("Payment failed. Your cart has not been cleared. Please try again.");
        setSubmitting(false);
      });
      paymentObject.open();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Could not start checkout. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p>Loading checkout...</p>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <Link to="/products" className="btn btn--primary">
          Continue Shopping
        </Link>
      </Layout>
    );
  }

  const field = (name, label) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 4 }}>{label}</label>
      <input
        name={name}
        value={form[name]}
        onChange={handleChange}
        disabled={submitting}
        style={{ width: "100%", padding: 10, boxSizing: "border-box" }}
      />
      {errors[name] && <small style={{ color: "red" }}>{errors[name]}</small>}
    </div>
  );

  return (
    <Layout>
      <h1>Checkout</h1>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <form onSubmit={handlePay} noValidate style={{ flex: 1, minWidth: 280 }}>
          <h3>Shipping Details</h3>
          {field("fullName", "Full Name")}
          {field("phone", "Phone")}
          {field("addressLine1", "Address")}
          {field("city", "City")}
          {field("state", "State")}
          {field("pincode", "Pincode")}

          {serverError && <p style={{ color: "red" }}>{serverError}</p>}

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </form>

        <div style={{ flex: 1, minWidth: 280 }}>
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div
              key={item.product._id}
              style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}
            >
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <hr />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Total</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <small style={{ color: "#666" }}>
            The final amount is recalculated on the server.
          </small>
        </div>
      </div>
    </Layout>
  );
}