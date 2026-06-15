// โหลด + validate environment variables ด้วย Zod
// demo (local): Postgres 18 ที่ 127.0.0.1:5432/eventx + JWT_SECRET มี default dev → รันได้ทันที
// production: ตั้ง DEMO_MODE=false → บังคับ JWT_SECRET จริง + ปิด endpoint เดโม่
import { z } from "zod";

const DEV_SECRET = "eventx-dev-secret-change-in-prod-0123456789";

const schema = z.object({
  DATABASE_URL: z.string().default("postgres://postgres:postgres@127.0.0.1:5432/eventx"),
  JWT_SECRET: z.string().min(16).default(DEV_SECRET),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:5173,https://dreamxcodeding.github.io"),
  // เดโม่: เปิด dev-assume-role + JWT default ได้ · production ตั้ง "false"
  DEMO_MODE: z.string().default("true"),
});

const parsed = schema.safeParse(Bun.env);
if (!parsed.success) {
  console.error("[ENV] ค่า environment ไม่ถูกต้อง:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const demoMode = env.DEMO_MODE !== "false";
export const corsOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);

// production (DEMO_MODE=false): ห้ามใช้ JWT_SECRET เริ่มต้น — refuse to start
if (!demoMode && env.JWT_SECRET === DEV_SECRET) {
  console.error("[SECURITY] DEMO_MODE=false แต่ JWT_SECRET ยังเป็นค่า dev เริ่มต้น — ตั้งค่า secret จริงก่อน (fly secrets set JWT_SECRET=...)");
  process.exit(1);
}
if (env.JWT_SECRET === DEV_SECRET) console.warn("[SECURITY] ใช้ JWT_SECRET dev เริ่มต้น (โหมดเดโม่) — ตั้งค่าจริงก่อน production");
if (demoMode) console.warn("[SECURITY] DEMO_MODE เปิดอยู่ — /auth/dev-assume-role ใช้งานได้ (ปิดด้วย DEMO_MODE=false ใน production)");
