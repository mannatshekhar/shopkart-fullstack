const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

function SearchBar({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search products..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        className="search-bar__select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat === "All Categories" ? "" : cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;
