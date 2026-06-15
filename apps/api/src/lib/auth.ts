// JWT sign/verify + middleware ตรวจ auth/role (hono/jwt) · อ่าน secret จาก env ต่อ request
import { sign, verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { getContext } from "hono/context-storage";
import { ApiError } from "./response.ts";
import type { Env } from "../env.ts";

export type Role = "CUSTOMER" | "AGENT" | "AFFILIATE" | "ORGANIZER" | "SPONSOR" | "ADMIN";
export interface JwtUser { id: string; name: string; email: string; phone?: string; role: Role }

const DAY = 60 * 60 * 24;

const secret = (): string => {
  const s = getContext<{ Bindings: Env }>().env.JWT_SECRET;
  if (!s || s.length < 16) throw new ApiError(500, "INTERNAL_ERROR", "JWT_SECRET ไม่ถูกตั้งค่า");
  return s;
};

export const signToken = (u: JwtUser): Promise<string> =>
  sign({ ...u, exp: Math.floor(Date.now() / 1000) + DAY * 7 }, secret(), "HS256");

// อ่าน Bearer token → ใส่ user ลง context (โยน UNAUTHORIZED ถ้าไม่ผ่าน)
export const requireAuth = createMiddleware<{ Variables: { user: JwtUser }; Bindings: Env }>(async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "ต้องเข้าสู่ระบบก่อน");
  try {
    const payload = (await verify(token, c.env.JWT_SECRET, "HS256")) as unknown as JwtUser;
    c.set("user", payload);
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }
  await next();
});

// ต้องมี role ที่กำหนด (ใช้ต่อจาก requireAuth)
export const requireRole = (...roles: Role[]) =>
  createMiddleware<{ Variables: { user: JwtUser }; Bindings: Env }>(async (c, next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) throw new ApiError(403, "FORBIDDEN", "ไม่มีสิทธิ์เข้าถึง");
    await next();
  });
