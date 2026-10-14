import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

function Layout({ children }) {
  return (
    <div className="home">
      <Navbar />
      <main className="products-page">{children}</main>
    </div>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data.order))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load this order.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="state-message">
          <div className="spinner" />
          <p>Loading order...</p>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="state-message state-message--error">
          <p>{error || "Order not found."}</p>
          <Link to="/orders" className="btn btn--primary">
            Back to My Orders
          </Link>
        </div>
      </Layout>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <Layout>
      {justPlaced && (
        <div
          style={{
            background: "#e8f5e9",
            border: "1px solid #a5d6a7",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            maxWidth: 700,
          }}
        >
          <h2 style={{ margin: 0 }}>✅ Order Placed Successfully</h2>
          <p style={{ margin: "8px 0 0" }}>Your order has been saved successfully.</p>
        </div>
      )}

      <h1 className="products-page__title">Order #{order._id.slice(-8)}</h1>
      <p style={{ color: "#666" }}>
        Order ID: {order._id}
        <br />
        Placed on{" "}
        {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
      <p>
        Status: <strong>{order.status}</strong> | Payment:{" "}
        <strong>{order.paymentStatus}</strong>
      </p>

      <div style={{ maxWidth: 700 }}>
        <h3>Items</h3>
        {order.items.map((item) => (
          <div
            key={item._id || item.product}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "8px 0",
            }}
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4 }}
              />
            )}
            <div style={{ flex: 1 }}>
              {item.name} × {item.quantity}
            </div>
            <div>₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
          </div>
        ))}

        <h2 style={{ textAlign: "right" }}>
          Total: ₹{order.totalAmount.toLocaleString("en-IN")}
        </h2>

        <h3>Shipping to</h3>
        <p style={{ lineHeight: 1.6 }}>
          {addr.fullName}
          <br />
          {addr.addressLine1}
          <br />
          {addr.city}, {addr.state} - {addr.pincode}
          <br />
          Phone: {addr.phone}
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link to="/orders" className="btn btn--primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn btn--primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
}