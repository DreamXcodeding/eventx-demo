# Deploy EventX API → Cloudflare Workers + Neon Postgres (ฟรี ไม่ต้องผูกบัตร)

Runtime = Cloudflare Workers (Hono) · DB = Neon (Postgres ผ่าน `@neondatabase/serverless`)

## 1) Database — Neon (ฟรี ไม่ต้องบัตร)
1. สมัคร https://neon.tech → New Project (region **Singapore** / ap-southeast-1)
2. คัดลอก **connection string** (`postgres://...neon.tech/...?sslmode=require`)

## 2) Local dev (`wrangler dev`)
```bash
cd apps/api
bun install
cp .dev.vars.example .dev.vars     # ใส่ DATABASE_URL (Neon) + JWT_SECRET
# สร้างตาราง + seed ใส่ Neon (รันครั้งเดียว ผ่าน Bun)
$env:DATABASE_URL="postgres://...neon.tech/...?sslmode=require"   # PowerShell
bun run migrate
bun run seed
bun run dev                        # = wrangler dev → http://localhost:8787
curl http://localhost:8787/health
```

## 3) Deploy → Cloudflare (ฟรี)
```bash
! wrangler login                   # เปิด browser ให้ล็อกอิน Cloudflare (ฟรี ไม่ต้องบัตร)
cd apps/api

# ตั้ง secrets (production)
wrangler secret put DATABASE_URL   # วาง Neon connection string
wrangler secret put JWT_SECRET     # วาง random ยาว ≥32 ตัว
wrangler secret put CORS_ORIGIN    # https://dreamxcodeding.github.io
wrangler secret put DEMO_MODE      # true (ให้ลองทุก portal) หรือ false (ปิด dev-assume-role)

bun run deploy                     # = wrangler deploy → ได้ URL https://eventx-api.<subdomain>.workers.dev
curl https://<worker-url>/health
```
> migration: รันจากเครื่อง dev/CI (ขั้น 2) — Worker ไม่รัน DDL เอง

## 4) ชี้เดโม่ (GitHub Pages) มาที่ Worker
build เว็บใน **PowerShell** (ดู memory `ecn-demo-deploy`) ด้วย env production:
```powershell
cd apps/web
$env:VITE_USE_MOCK = "false"
$env:VITE_API_BASE = "https://<worker-url>/api/v1"
bunx vite build --base=/eventx-demo/
$env:VITE_USE_MOCK = $null; $env:VITE_API_BASE = $null
Copy-Item dist/index.html dist/404.html -Force
# ... push gh-pages ตามขั้นตอนใน memory ecn-demo-deploy
```
ตรวจ: `Select-String 'workers.dev' dist/assets/*.js` ต้องเจอ · rollback กลับ mock = build โดยไม่ตั้ง VITE_*

## หมายเหตุ
- **ไม่ใช่ Bun runtime**: db.ts ใช้ Neon serverless + อ่าน env ต่อ request ผ่าน `hono/context-storage` · `index.ts` export Hono app เป็น Worker handler
- env: ใช้ `nodejs_compat` (qrcode/Buffer + AsyncLocalStorage) — ตั้งใน wrangler.toml แล้ว
- rate limit เป็น in-memory ต่อ isolate (รีเซ็ตเมื่อ isolate ถูก recycle) — กัน abuse พื้นฐานพอสำหรับเดโม่
- `.dev.vars` (local secrets) gitignored แล้ว
