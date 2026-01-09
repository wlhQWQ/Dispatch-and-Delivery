import axios from "axios";
import { BASE_URL } from "../constants";

const TOKEN_KEY = "dispatch_token";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setAuthToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export const apiClient = axios.create({
  // In development, don't use baseURL to let Vite proxy handle requests
  // In production, you may want to set baseURL to your backend URL
  baseURL: import.meta.env.DEV ? "" : BASE_URL,
  timeout: 15000,
  withCredentials: true,
}); 

// // 自动带上 token（如果后端用 Bearer token）
// apiClient.interceptors.request.use((config) => {
//   const token = getAuthToken();
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
