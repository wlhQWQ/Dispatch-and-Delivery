import { apiClient } from "./apiClient";

const USE_MOCK = false;

// Mock Data for Order List (Keep existing)
const MOCK_ORDERS = [
  {
    order_id: "ORD-1001",
    from_address: "123 Library St",
    to_address: "Dormitory Building A",
    status: "in transit",
    route: "mock_route_string",
    pickup_time: "2024-01-01T10:00:00Z",
    duration: 45,
    price: 15.5,
    item_description: "Textbooks x2, Laptop Stand",
    weight: 2.5,
  },
  // ... other mock orders
];

// 1. Get Orders List
export const getOrders = async () => {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_ORDERS), 600)
    );
  }
  try {
    const response = await apiClient.get("/dashboard/orders");
    return response.data;
  } catch (error) {
    console.error("Fetch orders failed:", error);
    throw error;
  }
};

// 2. Preview Route API (算路与询价)
// Input: { from_address, to_address }
// Output: [ { method: 'robot', price: 12, duration: 40, route: '...' }, ... ]
export const previewRoute = async (addressData) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Calculated Routes for:", addressData);
        // 模拟后端计算出来的动态数据
        resolve([
          {
            robot_type: "robot",
            name: "Autonomous Robot",
            price: 12.5, // 动态价格
            duration: 45, // 动态时长
            route: "polyline_data_robot_123", // 地图路线数据
            distance: 1500, // 距离 (米)
            robot_id: "ROBOT-001",
            description: "cheapest ground delivery.",
          },
          {
            robot_type: "drone",
            name: "Drone",
            price: 28.0,
            duration: 15,
            route: "polyline_data_drone_456",
            distance: 1200, // 距离 (米)
            robot_id: "DRONE-001",
            description: "Fastest aerial delivery.",
          },
        ]);
      }, 1500); // 模拟网络延迟 1.5s
    });
  }

  try {
    const response = await apiClient.post(
      "/dashboard/orders/deliveryOptions/preview",
      addressData
    );

    const data = response.data;

    // Check if response is an error object
    if (data.error || data.message) {
      throw new Error(
        data.message || data.error || "Backend returned an error"
      );
    }

    // Backend returns snake_case (robot_route, drone_route)
    // Support both camelCase and snake_case for compatibility
    const robotRoute = data.robotRoute || data.robot_route;
    const droneRoute = data.droneRoute || data.drone_route;

    // Validate routes exist
    if (!robotRoute) {
      console.error("⚠️ robotRoute is missing from backend response!");
    }
    if (!droneRoute) {
      console.error("⚠️ droneRoute is missing from backend response!");
    }

    // Map backend field names to frontend format
    const transformRoute = (route, type) => {
      // Defensive check: if route is undefined/null, return null
      if (!route) {
        console.warn(`${type} route is undefined in backend response`);
        return null;
      }

      return {
        robot_type: route.robot_type || route.robotType || type,
        name: type === "robot" ? "robot" : "drone",
        price: route.price,
        duration: route.duration,
        route: route.encoded_polyline || route.encodedPolyline,
        distance: route.distance,
        robot_id: route.robot_id || route.robotId,
        description:
          type === "robot"
            ? "cheapest ground delivery."
            : "Fastest aerial delivery.",
      };
    };

    // Filter out null routes (in case backend doesn't provide both)
    const routes = [
      transformRoute(robotRoute, "robot"),
      transformRoute(droneRoute, "drone"),
    ].filter((route) => route !== null);

    // Ensure we have at least one route
    if (routes.length === 0) {
      throw new Error(
        "No valid routes returned from backend. Check backend logs for errors."
      );
    }

    return routes;
  } catch (error) {
    console.error("Preview route failed:", error.message);

    // If it's an HTTP error response, extract the error message
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // If there's no response, it's likely a network error
    if (!error.response) {
      throw new Error(
        `Network error: ${error.message}. Is the backend running on ${apiClient.defaults.baseURL}?`
      );
    }

    throw error;
  }
};

// 3. Submit Order (整合最终数据)
export const createOrder = async (orderData) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Final Order Submitted:", orderData);
        // Add to mock list for demo purpose
        const newMockOrder = {
          order_id: `ORD-${Date.now().toString().slice(-4)}`,
          status: "dispatching",
          pickup_time: new Date().toISOString(),
          ...orderData,
        };
        MOCK_ORDERS.unshift(newMockOrder);
        resolve({ success: true });
      }, 1000);
    });
  }
  try {
    const response = await apiClient.post(
      "/dashboard/orders/deliveryOptions/submit",
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Create order failed:", error);
    throw error;
  }
};

// 4. Handle Payment Status from URL
// 从 URL 查询参数中获取支付状态
export const getPaymentStatusFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("payment_status");
};

// 清除 URL 中的 payment_status 参数
export const clearPaymentStatusFromURL = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("payment_status");
  window.history.replaceState({}, document.title, url.pathname);
};
