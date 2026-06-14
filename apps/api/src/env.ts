// โหลด + validate environment variables ด้วย Zod
// demo: ใช้ SQLite (ไฟล์) + JWT_SECRET มี default dev → รันได้ทันทีไม่ต้องมี .env
import { z } from "zod";

const schema = z.object({
  DATABASE_FILE: z.string().default("eventx.db"),
  JWT_SECRET: z.string().min(16).default("eventx-dev-secret-change-in-prod-0123456789"),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:5173,https://dreamxcodeding.github.io"),
});

const parsed = schema.safeParse(Bun.env);
if (!parsed.success) {
  console.error("[ENV] ค่า environment ไม่ถูกต้อง:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);

if (env.JWT_SECRET.startsWith("eventx-dev-secret")) console.warn("[SECURITY] ใช้ JWT_SECRET dev เริ่มต้น — ตั้งค่าจริงใน .env ก่อน production");
