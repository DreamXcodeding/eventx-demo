// EventX API — Hono บน Cloudflare Workers · entry point (export default = Worker fetch handler)
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { contextStorage } from "hono/context-storage";
import { ZodError } from "zod";
import { corsOriginsOf, type Env } from "./env.ts";
import { fail, ApiError } from "./lib/response.ts";
import auth from "./routes/auth.ts";
import events from "./routes/events.ts";
import orders from "./routes/orders.ts";
import tickets from "./routes/tickets.ts";
import checkin from "./routes/checkin.ts";
import affiliate from "./routes/affiliate.ts";
import agent from "./routes/agent.ts";
import organizer from "./routes/organizer.ts";
import admin from "./routes/admin.ts";

const app = new Hono<{ Bindings: Env }>();

app.use("*", contextStorage()); // ต้องมาก่อน — ให้ db.ts/auth.ts อ่าน env ต่อ request ได้
app.use("*", logger());
app.use("*", cors({
  origin: (origin, c) => { const o = corsOriginsOf(c.env); return o.includes(origin) ? origin : o[0]; },
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  credentials: true,
}));

app.get("/health", (c) => c.json({ success: true, data: { status: "ok", ts: Date.now() } }));

const v1 = new Hono<{ Bindings: Env }>();
v1.route("/auth", auth);
v1.route("/events", events);
v1.route("/orders", orders);
v1.route("/tickets", tickets);
v1.route("/checkin", checkin);
v1.route("/affiliate", affiliate);
v1.route("/agent", agent);
v1.route("/organizer", organizer);
v1.route("/admin", admin);
app.route("/api/v1", v1);

// error handler กลาง — แปลงทุก error เป็น format มาตรฐาน
app.onError((e, c) => {
  if (e instanceof ApiError) return fail(c, e.status, e.code, e.message, e.details);
  if (e instanceof ZodError) return fail(c, 400, "VALIDATION_ERROR", "ข้อมูลไม่ถูกต้อง", e.flatten());
  console.error("[ERROR]", e);
  return fail(c, 500, "INTERNAL_ERROR", "เกิดข้อผิดพลาดภายในระบบ");
});

app.notFound((c) => fail(c, 404, "NOT_FOUND", "ไม่พบ endpoint นี้"));

export default app;
