import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchProducts = async () => {
        setStatus("loading");
        try {
          const params = {};
          if (search.trim()) params.search = search.trim();
          if (category) params.category = category;

          const res = await getProducts(params);
          setProducts(res.data.products);
          setStatus("done");
        } catch (err) {
          setStatus("error");
        }
      };

      fetchProducts();
    }, 350);

    return () => clearTimeout(timer);
  }, [search, category]);

  return (
    <div className="home">
      <Navbar />

      <main className="products-page">
        <h1 className="products-page__title">Shop all products</h1>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {status === "loading" && (
          <div className="state-message">
            <div className="spinner" />
            <p>Loading products...</p>
          </div>
        )}

        {status === "error" && (
          <div className="state-message state-message--error">
            <p>Something went wrong while loading products.</p>
          </div>
        )}

        {status === "done" && products.length === 0 && (
          <div className="state-message">
            <p>No products found.</p>
          </div>
        )}

        {status === "done" && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
