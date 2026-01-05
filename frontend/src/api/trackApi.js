import { apiClient } from "./apiClient";

const USE_MOCK = false;

export const trackOrder = async (orderId, options = {}) => {
  console.log("trackOrder called with:", { orderId, options });

  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Tracking Order:", orderId);
        // Mock tracking data
        resolve({
          order_id: orderId,
          status: "in_transit",
          current_location: { lat: 40.7128, lng: -74.006 },
          estimated_arrival: "2024-01-01T11:30:00Z",
          from_address: "123 Library St",
          to_address: "Dormitory Building A",
          route: "mock_route_polyline",
          driver_name: "Robot-42",
        });
      }, 800);
    });
  }

  try {
    // Merge params properly to avoid overwriting
    const requestConfig = {
      ...options, // signal, timeout, etc.
      params: {
        id: orderId, // Ensure id is always set
      },
    };
    console.log("Request config:", requestConfig);
    console.log("Full URL will be: /dashboard/orders/tracking?id=" + orderId);

    const response = await apiClient.get(
      `/dashboard/orders/tracking`,
      requestConfig
    );

    // Transform backend response to match frontend expectations
    // Backend returns: { orderId, encodedRoute, lat, lng }
    // Frontend expects: { data: { route, position } }

    const backendData = response.data;
    console.log("Raw backend response:", backendData); // Debug: see actual field names
    console.log("Field names:", Object.keys(backendData)); // Debug: list all fields

    return {
      data: {
        order_id: backendData.order_id,
        route: backendData.encoded_route,
        position: {
          lat: backendData.lat,
          lng: backendData.lng,
        },
      },
    };
  } catch (error) {
    console.error("Track order failed:", error);
    throw error;
  }
};
