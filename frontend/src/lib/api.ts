import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true, // send/receive HttpOnly auth cookies
  headers: { "Content-Type": "application/json" },
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh", "/auth/logout"];

// On a 401, try a one-shot token refresh, then replay the original request.
let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthCall = AUTH_ENDPOINTS.some((u) => original?.url?.includes(u));

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ??
          api.post("/auth/refresh/").finally(() => {
            refreshPromise = null;
          });
        await refreshPromise;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
