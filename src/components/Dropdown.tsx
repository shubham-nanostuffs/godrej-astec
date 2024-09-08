import { useState } from "react";

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
    <div className="inline-block text-left">
      {/* Dropdown button */}
      <button
        className={`${buttonClass} inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none`}
        style={buttonStyle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <svg
          className={`w-5 h-5 ml-2 transition-transform duration-200 transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="relative right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* Search input */}
          <div className="px-3 py-2">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Dropdown items */}
          <div className="py-1 overflow-y-scroll h-screen">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.key}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    onClick(item);
                    setIsOpen(false); // Close the dropdown after selection
                  }}
                >
                  {item.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-700">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonDropdown;
