import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function CartItem({ item }) {
  const { updateQuantity, removeFromCart, busyId } = useCart();
  const { product, quantity } = item;
  const busy = busyId === product._id;
  const [error, setError] = useState("");

  const change = async (newQty) => {
    setError("");
    const result = await updateQuantity(product._id, newQty);
    if (!result.ok) setError(result.message);
  };

  const remove = async () => {
    setError("");
    const result = await removeFromCart(product._id);
    if (!result.ok) setError(result.message);
  };

  return (
    <div style={{ display: "flex", gap: 16, padding: 16, borderBottom: "1px solid #ddd", flexWrap: "wrap" }}>
      <img src={product.image} alt={product.name} style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8 }} />

      <div style={{ flex: 1, minWidth: 200 }}>
        <Link to={`/products/${product._id}`}><h3 style={{ margin: 0 }}>{product.name}</h3></Link>
        <p style={{ margin: "4px 0" }}>{formatPrice(product.price)}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className="btn" disabled={busy || quantity <= 1} onClick={() => change(quantity - 1)}>-</button>
          <span>{quantity}</span>
          <button type="button" className="btn" disabled={busy || quantity >= product.stock} onClick={() => change(quantity + 1)}>+</button>
          <button type="button" className="btn" disabled={busy} onClick={remove}>Remove</button>
        </div>
        {error && <p style={{ color: "#b3261e", fontSize: 14 }}>{error}</p>}
      </div>

      <strong>{formatPrice(product.price * quantity)}</strong>
    </div>
  );
}

export default CartItem;