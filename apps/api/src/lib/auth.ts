// JWT sign/verify + middleware ตรวจ auth/role (ใช้ hono/jwt — ไม่ต้องเพิ่ม dep)
import { sign, verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { env } from "../env.ts";
import { ApiError } from "./response.ts";

export type Role = "CUSTOMER" | "AGENT" | "AFFILIATE" | "ORGANIZER" | "SPONSOR" | "ADMIN";
export interface JwtUser { id: string; name: string; email: string; phone?: string; role: Role }

const DAY = 60 * 60 * 24;

export const signToken = (u: JwtUser) =>
  sign({ ...u, exp: Math.floor(Date.now() / 1000) + DAY * 7 }, env.JWT_SECRET, "HS256");

// อ่าน Bearer token → ใส่ user ลง context (โยน UNAUTHORIZED ถ้าไม่ผ่าน)
export const requireAuth = createMiddleware<{ Variables: { user: JwtUser } }>(async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "ต้องเข้าสู่ระบบก่อน");
  try {
    const payload = (await verify(token, env.JWT_SECRET, "HS256")) as unknown as JwtUser;
    c.set("user", payload);
  } catch {
    throw new ApiError(401, "UNAUTHORIZED", "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }
  await next();
});

// ต้องมี role ที่กำหนด (ใช้ต่อจาก requireAuth)
export const requireRole = (...roles: Role[]) =>
  createMiddleware<{ Variables: { user: JwtUser } }>(async (c, next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) throw new ApiError(403, "FORBIDDEN", "ไม่มีสิทธิ์เข้าถึง");
    await next();
  });
