import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  // Wishlist (from Lab 04)
  const [wishStatus, setWishStatus] = useState("idle"); // idle | saving | added | error
  const [wishError, setWishError] = useState("");

  // Cart (from Lab 05, uses the shared global state)
  const { addToCart, busyId, cartItems } = useCart();
  const [cartError, setCartError] = useState("");
  const adding = busyId === product._id;
  const inCart = cartItems.some((item) => item.product._id === product._id);

  const handleWishlist = async () => {
    if (wishStatus === "saving" || wishStatus === "added") return;

    setWishStatus("saving");
    setWishError("");

    try {
      await addToWishlist(product._id);
      setWishStatus("added");
    } catch (err) {
      if (err.response?.status === 409) {
        setWishStatus("added");
      } else if (err.response?.status === 401) {
        setWishStatus("error");
        setWishError("Please log in to save products.");
      } else {
        setWishStatus("error");
        setWishError("Unable to save product. Please try again.");
      }
    }
  };

  const handleAddToCart = async () => {
    if (adding) return;
    setCartError("");
    const result = await addToCart(product._id);
    if (!result.ok) setCartError(result.message);
  };

  const wishLabel =
    wishStatus === "saving"
      ? "⏳ Saving..."
      : wishStatus === "added"
      ? "♥ Added to Wishlist"
      : "♡ Add to Wishlist";

  return (
    <div className="product-card">
      <div className="product-card__image-wrap">
        <img src={product.image} alt={product.name} className="product-card__image" />
        {outOfStock && <span className="product-card__badge">Out of stock</span>}
      </div>

      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">{formatPrice(product.price)}</p>
        <p className={`product-card__stock ${outOfStock ? "product-card__stock--out" : ""}`}>
          {outOfStock ? "Out of stock" : `${product.stock} units left`}
        </p>

        <Link to={`/products/${product._id}`} className="btn btn--primary btn--block">
          View Details
        </Link>

        <button
          type="button"
          className="btn btn--block"
          style={{ marginTop: 8 }}
          onClick={handleAddToCart}
          disabled={adding || outOfStock}
        >
          {adding ? "Adding..." : inCart ? "Add Another" : "Add to Cart"}
        </button>
        {cartError && (
          <p style={{ color: "#b3261e", marginTop: 8, fontSize: 14 }}>{cartError}</p>
        )}

        <button
          type="button"
          className="btn btn--block"
          style={{ marginTop: 8 }}
          onClick={handleWishlist}
          disabled={wishStatus === "saving" || wishStatus === "added"}
        >
          {wishLabel}
        </button>
        {wishStatus === "error" && (
          <p style={{ color: "#b3261e", marginTop: 8, fontSize: 14 }}>{wishError}</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;