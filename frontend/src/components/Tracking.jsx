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
import { Drone, Bot } from "lucide-react";

export default function Tracking(props) {
  const order = props.order;
  const [route, setRoute] = useState("");
  const [position, setPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldZoom, setShouldZoom] = useState(true);
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);

  const id = order.id;
  const abortControllerRef = useRef(null);
  const positionsSetRef = useRef(false);

  function DrawRoute({ route, shouldZoom }) {
    const map = useMap();
    const geometryLib = useMapsLibrary("geometry");
    const polylineRef = useRef(null);

    useEffect(() => {
      if (!map || !route || !geometryLib) return;
      const decodedRoute = google.maps.geometry.encoding.decodePath(route);
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
      if (decodedRoute.length > 0 && !positionsSetRef.current) {
        const startPoint = decodedRoute[0];
        setStartPosition({ lat: startPoint.lat(), lng: startPoint.lng() });

        const endPoint = decodedRoute[decodedRoute.length - 1];
        setEndPosition({ lat: endPoint.lat(), lng: endPoint.lng() });
        positionsSetRef.current = true;
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

  function DrawPosition({ order, position }) {
    if (!position) return null;

    const Icon = order.deliveryMethod === "Robot" ? Bot : Drone;

    return (
      <AdvancedMarker
        position={{ lat: position.lat, lng: position.lng }}
        title={`Current Position (${
          order.deliveryMethod === "Robot" ? "Robot" : "Drone"
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

  //compute data, just for test
  function computeRouteAndPosition(order, encodedRoute) {
    if (!window.google?.maps?.geometry?.encoding) {
      console.warn("Google Maps geometry library not loaded yet");
      return null;
    }

    const pickupTime = new Date(order.pickupTime).getTime();
    const currentTime = Date.now();

    // Calculate duration between them
    let elapsed = currentTime - pickupTime;
    let duration = order.duration * 60000;

    // Calculate progress ratio
    let progressRatio = Math.min(1.0, elapsed / duration);

    //track info in terminal
    console.log("Debug tracking:", {
      pickupTime: order.pickupTime,
      pickupTimeMs: pickupTime,
      currentTime,
      elapsed,
      duration,
      progressRatio,
      elapsedMinutes: elapsed / 60000,
    });

    // If progress >= 1.0, delivery is complete (at end location)
    if (progressRatio >= 1.0) {
      return { lat: order.toLat, lng: order.toLng };
    }
    // Decode using Google's built-in decoder
    const pathPoints = google.maps.geometry.encoding.decodePath(encodedRoute);

    const currentPosition = getPositionAlongPath(pathPoints, progressRatio);

    return currentPosition;
  }

  function getPositionAlongPath(pathPoints, progressRatio) {
    if (!pathPoints || pathPoints.length === 0) {
      return null;
    }

    // Calculate total distance and segment distances
    let totalDistance = 0;
    let segmentDistances = [];

    for (let i = 0; i < pathPoints.length - 1; i++) {
      let segmentDist = calculateDistance(pathPoints[i], pathPoints[i + 1]);
      segmentDistances.push(segmentDist);
      totalDistance += segmentDist;
    }
    // Find target distance
    let targetDistance = totalDistance * progressRatio;

    // Find segment containing target distance
    let accumulatedDistance = 0;
    for (let i = 0; i < segmentDistances.length; i++) {
      let segmentDist = segmentDistances[i];

      if (accumulatedDistance + segmentDist >= targetDistance) {
        let distanceIntoSegment = targetDistance - accumulatedDistance;
        let segmentRatio = distanceIntoSegment / segmentDist;
        return interpolate(pathPoints[i], pathPoints[i + 1], segmentRatio);
      }

      accumulatedDistance += segmentDist;
    }

    return {
      lat: pathPoints[pathPoints.length - 1].lat(),
      lng: pathPoints[pathPoints.length - 1].lng(),
    };
  }

  function interpolate(start, end, ratio) {
    // Call .lat() and .lng() methods on LatLng objects
    const lat = start.lat() + (end.lat() - start.lat()) * ratio;
    const lng = start.lng() + (end.lng() - start.lng()) * ratio;
    return { lat, lng }; // Return plain object
  }

  //seems google map doesn't have this...
  function calculateDistance(point1, point2) {
    // Add this check
    if (!window.google?.maps?.geometry?.spherical) {
      console.warn("Google Maps geometry library not loaded yet");
      return 0; // Return 0 distance as fallback
    }

    return google.maps.geometry.spherical.computeDistanceBetween(
      point1,
      point2
    );
  }

  const fetchTrackingData = async (isInitialFetch = false) => {
    //cancel previous request(if no response for > 10s)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (isInitialFetch) {
        setRoute(order.encodedRoute);
      }

      const computedPosition = computeRouteAndPosition(
        order,
        order.encodedRoute
      );
      // Only update position if computation succeeded
      if (computedPosition) {
        setPosition(computedPosition);
        console.log("Mock tracking - Position updated:", computedPosition);
      }

      const res = await axios.get(
        `${BASE_URL}/dashboard/orders/track?id=${id}`,
        {
          headers: {
            // Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            Accept: "application/json",
          },
          signal: abortControllerRef.current.signal,
          timeout: isInitialFetch ? 30000 : 10000,
        }
      );
      console.log("check response:", res.data);

      setRoute(res.data.route);
      setPosition(res.data.position);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        console.log("position update request aborted");
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait a bit for Google Maps to be ready
    let interval;
    const initTimer = setTimeout(() => {
      const initializeTracking = async () => {
        await fetchTrackingData(true); // Wait for initial fetch to complete/timeout
        setIsLoading(false);
        interval = setInterval(fetchTrackingData, 10000); // Then start polling
      };

      initializeTracking();
    }, 1000); // Give Google Maps 1 second to initialize

    return () => {
      clearTimeout(initTimer);
      if (interval) {
        clearInterval(interval);
      }
      // Clean up abort controller on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

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
        <DrawPosition order={order} position={position} />

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
