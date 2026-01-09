import { useEffect, useState, useRef, useCallback } from "react";
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Drone, Bot } from "lucide-react";
import { trackOrder } from "../api/trackApi";

export default function Tracking(props) {
    
    // ... rest of code
  const { order_id, robot_type } = props;
  const [route, setRoute] = useState(null);
  const [position, setPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldZoom, setShouldZoom] = useState(true);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);

  const abortControllerRef = useRef(null);
  const setStartEndRef = useRef(false);
  const intervalRef = useRef(null);

  console.log("Tracking component received:", { order_id, robot_type });
  console.log("robot_type type:", typeof robot_type);
  console.log("robot_type exact value:", JSON.stringify(robot_type));

  // When route changes, update start and end marker, and shouldZoom
  useEffect(() => {
    setStartEndRef.current = false;
    setShouldZoom(true);
  }, [route]);

  function DrawRoute({ route, shouldZoom }) {
    const map = useMap();
    const geometryLib = useMapsLibrary("geometry");
    const polylineRef = useRef(null);

    useEffect(() => {
      if (!map || !route || !geometryLib) return;

      if (!google?.maps?.geometry?.encoding) {
        console.warn("Google Maps geometry encoding not available yet");
        return;
      }

      let decodedRoute;
      try {
        // Add error handling for decodePath
        decodedRoute = google.maps.geometry.encoding.decodePath(route);

        // Validate decoded route
        if (
          !decodedRoute ||
          !Array.isArray(decodedRoute) ||
          decodedRoute.length === 0
        ) {
          console.warn("Invalid decoded route: empty or invalid path");
          return;
        }
      } catch (error) {
        console.error("Error decoding route path:", error);
        return;
      }

      // Remove old polyline if exists
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      polylineRef.current = new google.maps.Polyline({
        path: decodedRoute,
        strokeColor: "#2563eb", //blue
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map,
      });

      //set start and end positions for markers (only once)
      if (decodedRoute.length > 0 && !setStartEndRef.current) {
        const startPoint = decodedRoute[0];
        setStartPosition({ lat: startPoint.lat(), lng: startPoint.lng() });

        const endPoint = decodedRoute[decodedRoute.length - 1];
        setEndPosition({ lat: endPoint.lat(), lng: endPoint.lng() });
        setStartEndRef.current = true;
      }

      //auto zoom to fit the route only once
      if (shouldZoom) {
        const bounds = new google.maps.LatLngBounds();
        decodedRoute.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds);
        setShouldZoom(false);
      }

      return () => {
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
        }
      };
    }, [map, route, shouldZoom, geometryLib]);
    return null;
  }

  function DrawPosition({ position }) {
    // Validate position data
    if (!position) return null;
    if (isNaN(position.lat) || isNaN(position.lng)) {
      console.warn("Invalid position data: lat or lng is NaN");
      return null;
    }

    const Icon = robot_type?.toLowerCase() === "robot" ? Bot : Drone;

    return (
      <AdvancedMarker
        position={{ lat: position.lat, lng: position.lng }}
        title={`Current Position (${
          robot_type === "Robot" ? "Robot" : "Drone"
        })`}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#3b82f6",
            border: "3px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon color="white" size={24} />
        </div>
      </AdvancedMarker>
    );
  }

  //useCallback: recreates this function when id changes
  const fetchTrackingData = useCallback(
    async (isInitialFetch = false) => {
      //cancel previous request(if no response for > 10s)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const res = await trackOrder(order_id, {
          signal: abortControllerRef.current.signal,
          timeout: isInitialFetch ? 30000 : 10000,
        });
        console.log("check response:", res.data);

        // Validate response data before setting state
        if (res.data) {
          
          // Validate route data
          if (res.data.route) {
            setRoute(res.data.route);
          } else {
            console.warn("Invalid route data received from API");
          }

          // Validate position data
          if (res.data.position) {
            setPosition(res.data.position);
          } else {
            console.warn("Invalid position data received from API");
          }
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          console.log("position update request aborted");
        } else {
          console.error(err);
        }
      } finally {
        // Only set loading to false on initial fetch
        if (isInitialFetch) {
          setIsLoading(false);
        }
      }
    },
    [order_id]
  );

  useEffect(() => {
    // Wait a bit for Google Maps to be ready
    const initTimer = setTimeout(() => {
      const initializeTracking = async () => {
        await fetchTrackingData(true); // Wait for initial fetch to complete/timeout (handles setIsLoading internally)
        intervalRef.current = setInterval(
          () => fetchTrackingData(false),
          10000
        ); // Then start polling with isInitialFetch=false
      };

      initializeTracking();
    }, 1000); // Give Google Maps 1 second to initialize

    return () => {
      clearTimeout(initTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Clean up abort controller on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [order_id, fetchTrackingData]);

  if (isLoading) {
    return <div>Loading tracking data...</div>;
  }

  //after loading show google map
  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
      libraries={["geometry"]}
    >
      <Map
        defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
        defaultZoom={12}
        mapId="DEMO_MAP_ID"
      >
        <DrawRoute route={route} shouldZoom={shouldZoom} />
        {/* <DrawRoute route={order.encodedroute} shouldZoom={shouldZoom} /> */}
        <DrawPosition position={position} />

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
  );
}
