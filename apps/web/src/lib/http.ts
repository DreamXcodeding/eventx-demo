// Axios HTTP client — base instance สำหรับเรียก ECN API (Bun + Hono)
// ใช้เมื่อ VITE_USE_MOCK=false · ดู API_SPEC.md สำหรับ endpoint
import axios, { AxiosError } from "axios";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") !== "false";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// แนบ Bearer token + locale ทุก request
http.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  const { locale } = useUiStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (locale) config.headers["Accept-Language"] = locale;
  return config;
});

// แปลง error ให้เป็นรูปแบบมาตรฐานของ ECN (ดู API_SPEC §11)
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: { code: string; message: string; details?: unknown } }>) => {
    const body = error.response?.data?.error;
    const apiError: ApiError = {
      code: body?.code ?? "NETWORK_ERROR",
      message: body?.message ?? error.message,
      status: error.response?.status ?? 0,
      details: body?.details,
    };
    return Promise.reject(apiError);
  }
);
