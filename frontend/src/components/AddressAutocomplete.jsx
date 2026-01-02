import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

// mock的地址库
const MOCK_SUGGESTIONS = [
  "123 Library St, College Station, TX",
  "Dormitory Building A, University Dr",
  "Teaching Building B, Science Park",
  "Cafeteria, Student Center",
  "Memorial Student Center (MSC), Texas A&M",
  "Kyle Field, 756 Houston St",
  "456 Receiver Ave, San Francisco, CA",
  "101 Silicon Valley Blvd, San Jose, CA",
];

export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  icon: Icon,
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  1;
  // 同步外部传进来的 value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 模拟搜索逻辑
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // 通知父组件更新

    if (val.length > 1) {
      setIsLoading(true);
      setShowDropdown(true);

      // 模拟 API 延迟，更有真实感
      setTimeout(() => {
        const filtered = MOCK_SUGGESTIONS.filter((addr) =>
          addr.toLowerCase().includes(val.toLowerCase())
        );
        setSuggestions(filtered);
        setIsLoading(false);
      }, 300);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion);
    onChange(suggestion);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute left-4 top-3.5 text-gray-400">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
        />
        {isLoading && (
          <div className="absolute right-4 top-3.5">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <ul>
            {suggestions.map((addr, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(addr)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
              >
                <div className="p-2 bg-gray-100 rounded-full shrink-0">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {addr}
                </span>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold text-right">
            Powered by Dispatch Map
          </div>
        </div>
      )}
    </div>
  );
}
