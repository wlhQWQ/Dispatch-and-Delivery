/**
 * 从 email 提取 username 用于显示
 * 例如: "alice@gmail.com" -> "Alice"
 *
 * @param {string} email - 用户的邮箱地址
 * @returns {string} - 提取并格式化的用户名
 */
export const extractUsernameFromEmail = (email) => {
  if (!email) return "Guest";

  // 提取 @ 之前的部分
  const username = email.split("@")[0];

  // 首字母大写
  return username.charAt(0).toUpperCase() + username.slice(1);
};

/**
 * 从用户名获取首字母缩写（用于头像）
 * 例如: "alice@gmail.com" -> "A"
 *
 * @param {string} email - 用户的邮箱地址
 * @returns {string} - 首字母缩写
 */
export const getUserInitials = (email) => {
  if (!email) return "?";

  const username = email.split("@")[0];
  return username.charAt(0).toUpperCase();
};
