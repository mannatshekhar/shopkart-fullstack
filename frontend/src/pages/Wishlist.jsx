import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const loadWishlist = async () => {
    setStatus("loading");
    try {
      const res = await getWishlist();
      setItems(res.data.wishlist);
      setStatus("done");
    } catch (err) {
      setStatus("error");
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    if (removingId) return;
    setRemovingId(productId);
    setRemoveError("");
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setRemoveError("Unable to remove product. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="home">
      <Navbar />

      <main className="products-page">
        <h1 className="products-page__title">My Wishlist</h1>

        {status === "done" && items.length > 0 && (
          <p>
            {items.length} {items.length === 1 ? "product" : "products"} saved
          </p>
        )}

        {removeError && (
          <p style={{ color: "#b3261e", marginBottom: 12 }}>{removeError}</p>
        )}

        {status === "loading" && (
          <div className="state-message">
            <div className="spinner" />
            <p>Loading your wishlist...</p>
          </div>
        )}

        {status === "error" && (
          <div className="state-message state-message--error">
            <h2>Something went wrong.</h2>
            <p>We couldn't load your wishlist.</p>
            <button type="button" className="btn btn--primary" onClick={loadWishlist}>
              Try Again
            </button>
          </div>
        )}

        {status === "done" && items.length === 0 && (
          <div className="state-message">
            <div style={{ fontSize: 48 }}>❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <Link to="/products" className="btn btn--primary">
              Browse Products
            </Link>
          </div>
        )}

        {status === "done" && items.length > 0 && (
          <div className="product-grid">
            {items.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                removing={removingId === product._id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;