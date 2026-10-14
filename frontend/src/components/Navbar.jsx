import { Link, useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar({ customerName }) {
  const navigate = useNavigate();
  const { totalItems, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      // ignore: we still send the user to the login page
    } finally {
      clearCart();
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="navbar">
      <Link to="/home" className="navbar__brand">
        <svg width="26" height="26" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M5 8H8.5L11.2 21.5C11.5 22.9 12.7 24 14.2 24H25.5C26.9 24 28.1 23 28.4 21.6L30.5 12.5H9.7" stroke="#F2A93B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="15" cy="28.5" r="1.8" fill="#F2A93B"/>
          <circle cx="24.5" cy="28.5" r="1.8" fill="#F2A93B"/>
        </svg>
        <span>ShopKart</span>
      </Link>

      <nav className="navbar__links">
        <Link to="/home">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/cart">Cart ({totalItems})</Link>
        <Link to="/orders">My Orders</Link>
      </nav>

      <div className="navbar__right">
        {customerName && <span className="navbar__greeting">Hi, {customerName}</span>}
        <button className="btn btn--ghost-dark" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;