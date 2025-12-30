import { apiClient } from "./apiClient";

// 开关：后端没好时设为 true，好了设为 false
const USE_MOCK = true;

// 1. 符合新接口定义的 Mock 数据
const MOCK_ORDERS = [
  {
    order_id: "ORD-1001",
    from_address: "123 Library St",
    to_address: "Dormitory Building A",
    status: "in_transit", // pending, in_transit, delivered
    route: "encoded_polyline_string_here",
    pickup_time: "2024-01-01T10:00:00Z",
    duration: 45, // int
    price: 15.5, // float
    item_description: "Textbooks x2, Laptop Stand", // string
    weight: 2.5, // float
    robot_type: "robot", // string
  },
  {
    order_id: "ORD-1002",
    from_address: "Cafeteria",
    to_address: "Teaching Building B",
    status: "delivered",
    route: "...",
    pickup_time: "2024-01-02T12:30:00Z",
    duration: 15,
    price: 25.0,
    item_description: "Iced Coffee, Bagel",
    weight: 0.8,
    robot_type: "drone",
  },
];

// GET /dashboard/orders
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

// POST /dashboard/orders/deliveryOptions
export const createOrder = async (orderData) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Mock Submit Payload:", orderData);
        // 模拟后端把新订单插入列表
        const newMockOrder = {
          order_id: `ORD-${Date.now().toString().slice(-4)}`,
          status: "pending",
          pickup_time: new Date().toISOString(),
          route: "mock_route",
          robot_type: orderData.price > 20 ? "drone" : "robot", // 简单模拟
          ...orderData,
        };
        MOCK_ORDERS.unshift(newMockOrder);

        // 响应体: { success: boolean }
        resolve({ success: true });
      }, 1000);
    });
  }
  try {
    const response = await apiClient.post(
      "/dashboard/orders/deliveryOptions",
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Create order failed:", error);
    throw error;
  }
};
