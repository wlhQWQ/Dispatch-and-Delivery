import { apiClient } from "./apiClient";

// 1. 获取订单列表
// 对应后端 Controller: GET /orders
export const getOrders = async () => {
  try {
    const response = await apiClient.get("/orders");
    // 注意：如果你的后端返回格式是 { code: 200, data: [...] }，请改为 return response.data.data;
    // 目前假设后端直接返回订单数组
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw error;
  }
};

// 2. 提交新订单
// 对应后端 Controller: POST /orders
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post("/orders", orderData);
    return response.data;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};
