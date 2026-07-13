import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

function SearchBar({ value, onChange, placeholder = "Search Candidate..." }) {
  return (
    <div className="search-container">
      <FaSearch className="search-icon" />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default SearchBar;