import { useEffect, useState, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import axios from "axios";
import { BASE_URL, TOKEN_KEY } from "../constants";

function useGeocoder() {
  const geocodingLib = useMapsLibrary("geocoding");
  const [geocoder, setGeocoder] = useState(null);

  useEffect(() => {
    if (geocodingLib && !geocoder) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [geocodingLib, geocoder]);

  const geocodeAddress = async (address) => {
    if (!geocoder) {
      return null;
    }

    try {
      const res = await geocoder.geocode({ address });
      if (res.results && res.results.length > 0) {
        const location = res.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
        };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };
  return { geocoder, geocodeAddress };
}

export default function ViewMap(props) {
  const shippingData = props.shippingData;

  const [route, setRoute] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const hasInitialized = useRef(false);

  // Check for Google Maps API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          margin: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "16px",
            borderRadius: "4px",
            textAlign: "left",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
            To fix this:
          </p>
          <ol style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>
              Create a file named <code>.env</code> in the{" "}
              <code>frontend/</code> directory
            </li>
            <li>
              Add this line:{" "}
              <code>VITE_GOOGLE_MAP_API_KEY=your_actual_key_here</code>
            </li>
            <li>
              Get your API key from{" "}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Cloud Console
              </a>
            </li>
            <li>Restart the dev server</li>
          </ol>
          <p style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
            See <code>frontend/GOOGLE_MAPS_FRONTEND_SETUP.md</code> for detailed
            instructions.
          </p>
        </div>
      </div>
    );
  }

  // Validate shippingData
  if (!shippingData || !shippingData.fromAddress || !shippingData.toAddress) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
         Error: Missing shipping data (fromAddress or toAddress)
      </div>
    );
  }

  function DrawRoute({ route }) {
    const map = useMap();
    const geometryLib = useMapsLibrary("geometry");
    const polylineRef = useRef(null);

    useEffect(() => {
      if (!map || !route || !geometryLib) return;
      const decodedRoute =
        window.google.maps.geometry.encoding.decodePath(route);
      // Remove old polyline if exists
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      polylineRef.current = new window.google.maps.Polyline({
        path: decodedRoute,
        strokeColor: "#2563eb", //blue
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map,
      });

      const bounds = new window.google.maps.LatLngBounds();
      decodedRoute.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds);

      return () => {
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
        }
      };
    }, [map, route, geometryLib]);
    return null;
  }
  function RouteManager() {
    const { geocoder, geocodeAddress } = useGeocoder();

    useEffect(() => {
      if (!geocoder || hasInitialized.current) return;

      async function getRoute() {
        try {
          setIsLoading(true);
          hasInitialized.current = true;

          const url = `${BASE_URL}/dashboard/orders/deliveryOptions`;
          const fromCoord = await geocodeAddress(shippingData.fromAddress);
          const toCoord = await geocodeAddress(shippingData.toAddress);

          if (!fromCoord || !toCoord) {
            console.error("Failed to geocode addresses");
            setIsLoading(false);
            return;
          }

          setStartPosition(fromCoord);
          setEndPosition(toCoord);
          const data = {
            fromAddress: shippingData.fromAddress,
            toAddress: shippingData.toAddress,
            fromLng: fromCoord.lng,
            fromLat: fromCoord.lat,
            toLng: toCoord.lng,
            toLat: toCoord.lat,
          };

          const config = {
            headers: {
              "Content-type": "application/json",
            },
            timeout: 10000,
          };

          const res = await axios.post(url, data, config);

          if (res.data && res.data.encodedPolyline) {
            setRoute(res.data.encodedPolyline);
          }
        } catch (err) {
          console.error("Error fetching route:", err.message);
        } finally {
          setIsLoading(false);
        }
      }

      getRoute();
    }, [geocoder, geocodeAddress]);

    return null;
  }

  //always render map so RouteManager can initialize
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", marginBottom: "10px" }}>
              Loading route data...
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Geocoding addresses and fetching route from server
            </div>
          </div>
        </div>
      )}
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
        libraries={["geometry", "geocoding"]}
      >
        <Map
          defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
          defaultZoom={12}
          mapId="DEMO_MAP_ID"
        >
          <RouteManager />
          {route && <DrawRoute route={route} />}

          {/* Start Marker */}
          {startPosition && (
            <AdvancedMarker
              position={startPosition}
              title="Start Position (Pickup)"
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  border: "3px solid white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
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
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  border: "3px solid white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                E
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
