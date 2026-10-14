import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyOrders } from "../services/api";

function Layout({ children }) {
  return (
    <div className="home">
      <Navbar />
      <main className="products-page">{children}</main>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load your orders.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="state-message">
          <div className="spinner" />
          <p>Loading your orders...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="state-message state-message--error">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <h1 className="products-page__title">My Orders</h1>
        <div className="state-message">
          <p>You have not placed any orders yet.</p>
          <Link to="/products" className="btn btn--primary">
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="products-page__title">My Orders</h1>
      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            maxWidth: 700,
          }}
        >
          <h3 style={{ margin: 0 }}>Order #{order._id.slice(-8)}</h3>
          <p style={{ color: "#666", margin: "4px 0 12px" }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          {order.items.map((item) => (
            <p key={item._id || item.product} style={{ margin: "2px 0" }}>
              {item.name} × {item.quantity}
            </p>
          ))}

          <p style={{ fontWeight: "bold", marginBottom: 4 }}>
            Total: ₹{order.totalAmount.toLocaleString("en-IN")}
          </p>
          <p style={{ margin: "0 0 12px" }}>Status: {order.status}</p>

          <Link to={`/orders/${order._id}`} className="btn btn--primary">
            View Details
          </Link>
        </div>
      ))}
    </Layout>
  );
}