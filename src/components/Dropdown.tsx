import { useState } from "react";
import styles from "./styles.module.css";

interface CommonDropdownProps {
  label: string;
  items: { key: string; label: string }[];
  buttonClass?: string;
  buttonStyle?: React.CSSProperties;
  onClick: (item: { key: string; label: string }) => void;
}

const CommonDropdown: React.FC<CommonDropdownProps> = ({
  label,
  items,
  buttonClass,
  buttonStyle,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Filter items based on the search input
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={styles.dropdownContainer}>
      {/* Dropdown button */}
      <button
        className={buttonClass}
        style={buttonStyle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {/* Search input */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className={styles.dropdownSearch}
          />

          {/* Dropdown items */}
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.key}
                className={styles.dropdownItem}
                onClick={() => {
                  onClick(item);
                  setIsOpen(false); // Close the dropdown after selection
                }}
              >
                {item.label}
              </div>
            ))
          ) : (
            <div className={styles.dropdownItem}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommonDropdown;
