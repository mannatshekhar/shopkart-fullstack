import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, totalItems, subtotal, refreshCart } = useCart();

  return (
    <div className="home">
      <Navbar />

      <main className="products-page">
        <h1 className="products-page__title">My Cart</h1>

        {loading && (
          <div className="state-message">
            <div className="spinner" />
            <p>Loading your cart...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-message state-message--error">
            <p>Unable to load your cart.</p>
            <button type="button" className="btn btn--primary" onClick={refreshCart}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="state-message">
            <div style={{ fontSize: 48 }}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn--primary">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div>
            {cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}

            <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8, maxWidth: 360 }}>
              <h2 style={{ marginTop: 0 }}>Order Summary</h2>
              <p>Items: {totalItems}</p>
              <p><strong>Subtotal: {formatPrice(subtotal)}</strong></p>
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;