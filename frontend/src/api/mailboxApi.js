import { apiClient } from "./apiClient";

/**
 * 期望后端：GET /dashboard/mailbox
 * 返回可以是：
 * - [{ id, subject, content, timestamp, read, type, orderId, actionRequired }]
 * - 或者 [{ message, time, ... }]
 */
export async function fetchMailboxMessages() {
  // No need to pass userId - backend gets it from session
  const res = await apiClient.get("/dashboard/mailbox");
  return res.data;
}

/**
 * 期望后端：POST /dashboard/mailbox/confirm
 * body: { messageId, orderId, action, time }
 *
 * 如果你们后端将来用别的 URL，只改这里即可
 */
export async function confirmMailboxAction({ messageId, orderId, action }) {
  const body = {
    messageId,
    orderId,
    action, // "PICKUP" | "DELIVERY" | "ACK"
    time: new Date().toISOString(),
  };
  const res = await apiClient.post("/dashboard/mailbox/confirm", body);
  return res.data;
}
