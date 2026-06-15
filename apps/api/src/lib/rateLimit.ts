// Rate limiter แบบ in-memory (sliding window) ต่อ IP+bucket — พอสำหรับเดโม่/single instance
// production จริงควรใช้ Redis/edge limiter; นี่กัน abuse พื้นฐาน (เช่น ยิง OTP รัว)
import { createMiddleware } from "hono/factory";
import { ApiError } from "./response.ts";

const hits = new Map<string, number[]>();

export const rateLimit = (max: number, windowMs: number, bucket = "default") =>
  createMiddleware(async (c, next) => {
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "local";
    const key = `${bucket}:${ip}`;
    const now = Date.now();
    const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (arr.length >= max) throw new ApiError(429, "RATE_LIMITED", "คำขอถี่เกินไป กรุณาลองใหม่อีกครั้งภายหลัง");
    arr.push(now);
    hits.set(key, arr);
    await next();
  });
