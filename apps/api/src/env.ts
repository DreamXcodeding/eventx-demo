// Cloudflare Workers env (bindings/secrets) — ส่งผ่าน c.env ต่อ request (ไม่มี global env)
// local: .dev.vars · prod: `wrangler secret put`
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
  DEMO_MODE?: string;
}

export const DEV_SECRET = "eventx-dev-secret-change-in-prod-0123456789";

// เดโม่: เปิด /auth/dev-assume-role · production ตั้ง DEMO_MODE=false เพื่อปิด
export const isDemo = (env: Env): boolean => env.DEMO_MODE !== "false";

export const corsOriginsOf = (env: Env): string[] =>
  (env.CORS_ORIGIN ?? "http://localhost:5173,https://dreamxcodeding.github.io")
    .split(",").map((s) => s.trim()).filter(Boolean);
