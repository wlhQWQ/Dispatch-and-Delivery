import { useEffect, useState, useRef, useCallback } from "react";
import {
  Map,
  useMap,
  AdvancedMarker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

// Move DrawRoute outside to prevent recreation on each render
function DrawRoute({ route, onRouteLoaded, onError }) {
  const map = useMap();
  const geometryLib = useMapsLibrary("geometry");
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !route || !geometryLib) return;

    try {
      const decodedRoute =
        window.google.maps.geometry.encoding.decodePath(route);

      if (!decodedRoute || decodedRoute.length === 0) {
        onError("Route data is invalid or empty");
        return;
      }

      // Extract start and end positions from decoded route
      const startPoint = decodedRoute[0];
      const endPoint = decodedRoute[decodedRoute.length - 1];

      const startPos = {
        lat: startPoint.lat(),
        lng: startPoint.lng(),
      };
      const endPos = {
        lat: endPoint.lat(),
        lng: endPoint.lng(),
      };

      // Remove old polyline if exists
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      // Draw the route
      polylineRef.current = new window.google.maps.Polyline({
        path: decodedRoute,
        strokeColor: "#2563eb", //blue
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map,
      });

      // Fit map bounds to show entire route
      const bounds = new window.google.maps.LatLngBounds();
      decodedRoute.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds);

      // Notify parent that route is loaded
      onRouteLoaded(startPos, endPos);
    } catch (err) {
      console.error("Error decoding route:", err);
      onError("Failed to decode route data");
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, route, geometryLib, onRouteLoaded, onError]);

  return null;
}

export default function ViewMap({ route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [error, setError] = useState(null);

  // Check for Google Maps API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  // Reset loading state when route changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [route]);

  // Memoize callbacks to prevent recreation
  const handleRouteLoaded = useCallback((start, end) => {
    setStartPosition(start);
    setEndPosition(end);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((errorMsg) => {
    setError(errorMsg);
    setIsLoading(false);
  }, []);

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    return (
      <div className="p-10 text-center bg-amber-100 border-2 border-amber-400 rounded-lg m-5">
        Invalid Google Map API key
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center rounded-lg m-5">
        <p className="font-semibold">Unable to display route</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="text-lg mb-2.5">Loading map...</div>
            <div className="text-sm text-gray-600">
              Rendering route visualization
            </div>
          </div>
        </div>
      )}

      <Map
        defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
        defaultZoom={12}
        mapId="DEMO_MAP_ID"
      >
        {route && (
          <DrawRoute
            route={route}
            onRouteLoaded={handleRouteLoaded}
            onError={handleError}
          />
        )}

        {/* Start Marker */}
        {startPosition && (
          <AdvancedMarker position={startPosition} title="Start Position">
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-[3px] border-white shadow-md flex items-center justify-center text-white font-bold text-base">
              S
            </div>
          </AdvancedMarker>
        )}

        {/* End Marker */}
        {endPosition && (
          <AdvancedMarker
            position={endPosition}
            title="End Position (Delivery)"
          >
            <div className="w-8 h-8 rounded-full bg-red-500 border-[3px] border-white shadow-md flex items-center justify-center text-white font-bold text-base">
              E
            </div>
          </AdvancedMarker>
        )}
      </Map>
    </div>
  );
}
