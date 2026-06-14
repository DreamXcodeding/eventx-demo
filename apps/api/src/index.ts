// EventX API — Hono + Bun · entry point
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import { env, corsOrigins } from "./env.ts";
import { fail, ApiError } from "./lib/response.ts";
import auth from "./routes/auth.ts";
import events from "./routes/events.ts";
import orders from "./routes/orders.ts";
import tickets from "./routes/tickets.ts";
import checkin from "./routes/checkin.ts";
import affiliate from "./routes/affiliate.ts";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({
  origin: (origin) => (corsOrigins.includes(origin) ? origin : corsOrigins[0]),
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  credentials: true,
}));

app.get("/health", (c) => c.json({ success: true, data: { status: "ok", ts: Date.now() } }));

const v1 = new Hono();
v1.route("/auth", auth);
v1.route("/events", events);
v1.route("/orders", orders);
v1.route("/tickets", tickets);
v1.route("/checkin", checkin);
v1.route("/affiliate", affiliate);
app.route("/api/v1", v1);

// error handler กลาง — แปลงทุก error เป็น format มาตรฐาน
app.onError((e, c) => {
  if (e instanceof ApiError) return fail(c, e.status, e.code, e.message, e.details);
  if (e instanceof ZodError) return fail(c, 400, "VALIDATION_ERROR", "ข้อมูลไม่ถูกต้อง", e.flatten());
  console.error("[ERROR]", e);
  return fail(c, 500, "INTERNAL_ERROR", "เกิดข้อผิดพลาดภายในระบบ");
});

app.notFound((c) => fail(c, 404, "NOT_FOUND", "ไม่พบ endpoint นี้"));

console.log(`[API] EventX API listening on http://localhost:${env.PORT}  (CORS: ${corsOrigins.join(", ")})`);
export default { port: env.PORT, fetch: app.fetch };
