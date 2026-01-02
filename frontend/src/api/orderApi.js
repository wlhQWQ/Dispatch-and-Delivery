// // 实现创建orderlist和submit created orders的api
// import { apiClient } from "./apiClient";

// // 开关：后端没好时设为 true，好了设为 false
// const USE_MOCK = true;

// // 1. 符合新接口定义的 Mock 数据
// const MOCK_ORDERS = [
//   {
//     order_id: "ORD-1001",
//     from_address: "123 Library St",
//     to_address: "Dormitory Building A",
//     status: "in_transit", // pending, in_transit, delivered
//     route: "encoded_polyline_string_here",
//     pickup_time: "2024-01-01T10:00:00Z",
//     duration: 45, // int
//     price: 15.5, // float
//     item_description: "Textbooks x2, Laptop Stand", // string
//     weight: 2.5, // float
//     robot_type: "robot", // string
//   },
//   {
//     order_id: "ORD-1002",
//     from_address: "Cafeteria",
//     to_address: "Teaching Building B",
//     status: "completed",
//     route: "...",
//     pickup_time: "2024-01-02T12:30:00Z",
//     duration: 15,
//     price: 25.0,
//     item_description: "Iced Coffee, Bagel",
//     weight: 0.8,
//     robot_type: "drone",
//   },
// ];

// // GET /dashboard/orders
// export const getOrders = async () => {
//   if (USE_MOCK) {
//     return new Promise((resolve) =>
//       setTimeout(() => resolve(MOCK_ORDERS), 600)
//     );
//   }
//   try {
//     const response = await apiClient.get("/dashboard/orders");
//     return response.data;
//   } catch (error) {
//     console.error("Fetch orders failed:", error);
//     throw error;
//   }
// };

// // POST /dashboard/orders/deliveryOptions
// export const createOrder = async (orderData) => {
//   if (USE_MOCK) {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         console.log("Mock Submit Payload:", orderData);
//         // 模拟后端把新订单插入列表
//         const newMockOrder = {
//           order_id: `ORD-${Date.now().toString().slice(-4)}`,
//           status: "pending",
//           pickup_time: new Date().toISOString(),
//           route: "mock_route",
//           robot_type: orderData.price > 20 ? "drone" : "robot", // 简单模拟
//           ...orderData,
//         };
//         MOCK_ORDERS.unshift(newMockOrder);

//         // 响应体: { success: boolean }
//         resolve({ success: true });
//       }, 1000);
//     });
//   }
//   try {
//     const response = await apiClient.post(
//       "/dashboard/orders/deliveryOptions",
//       orderData
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Create order failed:", error);
//     throw error;
//   }
// };
// // createOrder封装了发送 POST 请求的逻辑
// // connect 后端时直接把mock_order删掉

import { apiClient } from "./apiClient";

const USE_MOCK = true;

// Mock Data for Order List (Keep existing)
const MOCK_ORDERS = [
  {
    order_id: "ORD-1001",
    from_address: "123 Library St",
    to_address: "Dormitory Building A",
    status: "in_transit",
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
            id: "robot",
            name: "Autonomous Robot",
            price: 12.5, // 动态价格
            duration: 45, // 动态时长
            route: "polyline_data_robot_123", // 地图路线数据
            description: "Eco-friendly. Best for ground delivery.",
          },
          {
            id: "drone",
            name: "Drone",
            price: 28.0,
            duration: 15,
            route: "polyline_data_drone_456",
            description: "Fastest aerial delivery for urgent needs.",
          },
        ]);
      }, 1500); // 模拟网络延迟 1.5s
    });
  }

  try {
    // 后端接口是 POST /dashboard/orders/deliveryOptions
    const response = await apiClient.post(
      "/dashboard/orders/deliveryOptions",
      addressData
    );
    return response.data;
  } catch (error) {
    console.error("Preview route failed:", error);
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
      "/dashboard/orders/deliveryOptions",
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Create order failed:", error);
    throw error;
  }
};
