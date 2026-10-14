import { Link } from "react-router-dom";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function WishlistCard({ product, onRemove, removing }) {
  const outOfStock = product.stock <= 0;

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
          onClick={() => onRemove(product._id)}
          disabled={removing}
        >
          {removing ? "Removing..." : "Remove ♥"}
        </button>
      </div>
    </div>
  );
}

export default WishlistCard;