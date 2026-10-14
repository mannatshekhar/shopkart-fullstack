import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/api";
import Navbar from "../components/Navbar";

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setStatus("loading");
      try {
        const res = await getProductById(id);
        if (isMounted) {
          setProduct(res.data.product);
          setStatus("done");
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err.response?.data?.message || "Something went wrong while loading this product.";
          setErrorMessage(message);
          setStatus("error");
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="home">
      <Navbar />

      <main className="product-details">
        {status === "loading" && (
          <div className="state-message">
            <div className="spinner" />
            <p>Loading product...</p>
          </div>
        )}

        {status === "error" && (
          <div className="state-message state-message--error">
            <p>{errorMessage}</p>
            <Link to="/products" className="btn btn--primary" style={{ marginTop: 16 }}>
              Back to products
            </Link>
          </div>
        )}

        {status === "done" && product && (
          <div className="product-details__grid">
            <div className="product-details__image-wrap">
              <img src={product.image} alt={product.name} className="product-details__image" />
            </div>

            <div className="product-details__info">
              <p className="product-card__category">{product.category}</p>
              <h1 className="product-details__name">{product.name}</h1>
              <p className="product-details__price">{formatPrice(product.price)}</p>
              <p className="product-details__description">{product.description}</p>

              <p
                className={`product-card__stock ${
                  product.stock <= 0 ? "product-card__stock--out" : ""
                }`}
              >
                {product.stock <= 0 ? "Out of stock" : `${product.stock} units left`}
              </p>

              <button className="btn btn--primary btn--block" disabled={product.stock <= 0}>
                {product.stock <= 0 ? "Out of stock" : "Add to Cart"}
              </button>

              <Link to="/products" className="product-details__back">
                &larr; Back to products
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;
