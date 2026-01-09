import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

// San Francisco 坐标 (用于限制搜索范围)
const SF_CENTER = { lat: 37.7749, lng: -122.4194 };
const SEARCH_RADIUS_METERS = 300000; // 限制在sf center coord 600km

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

  // 使用 Google Maps Places library
  const placesLib = useMapsLibrary("places");
  const [autocompleteService, setAutocompleteService] = useState(null);

  // 初始化 Google Places services
  useEffect(() => {
    if (!placesLib) return;

    setAutocompleteService(new placesLib.AutocompleteService());
  }, [placesLib]);

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

  // 使用 Google Places Autocomplete API 搜索
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (val.length > 2 && autocompleteService && placesLib) {
      setIsLoading(true);
      setShowDropdown(true);

      // 调用 Google Places Autocomplete API
      autocompleteService.getPlacePredictions(
        {
          input: val,
          types: ["address"], // 只返回地址类型
          location: new window.google.maps.LatLng(SF_CENTER.lat, SF_CENTER.lng),
          radius: SEARCH_RADIUS_METERS, // 600km 半径
          componentRestrictions: { country: "us" }, // 限制为美国
        },
        (predictions, status) => {
          setIsLoading(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            // 转换成我们需要的格式
            const formattedSuggestions = predictions.map((p) => ({
              description: p.description,
              placeId: p.place_id,
            }));
            setSuggestions(formattedSuggestions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.description);
    onChange(suggestion.description);
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
            {suggestions.map((suggestion, idx) => (
              <li
                key={suggestion.placeId || idx}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
              >
                <div className="p-2 bg-gray-100 rounded-full shrink-0">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  {suggestion.description}
                </span>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold text-right">
            Powered by Google Maps
          </div>
        </div>
      )}
    </div>
  );
}
