import { useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// 1. Centralized Axios Instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
});

// 2. Global Request Interceptor (Automatically attaches token)
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("admin_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. The Reusable Hook
export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient(config);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { request, isLoading, error, setError };
}
