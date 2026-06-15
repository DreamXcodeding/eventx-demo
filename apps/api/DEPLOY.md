# Deploy EventX API ขึ้น cloud (Fly.io + Neon Postgres)

ทุกขั้นด้านล่างต้องใช้ **account ของคุณ** (ผมรันแทนไม่ได้) — ทำตามทีละขั้น
หรือพิมพ์ใน Claude Code ด้วย `! <command>` เพื่อให้รันในเซสชันนี้ (เช่นตอน login)

## 1) Database — Neon (ฟรี)
1. สมัคร https://neon.tech → New Project (region Singapore)
2. คัดลอก **connection string** (ขึ้นต้น `postgres://...neon.tech/...?sslmode=require`)

## 2) API — Fly.io (ฟรี tier)
```bash
# ติดตั้ง flyctl: https://fly.io/docs/flyctl/install
! fly auth login                       # เปิด browser ให้ล็อกอิน
cd apps/api
fly launch --no-deploy                 # สร้าง app (ตอบ No ถ้าถาม Postgres ของ fly — เราใช้ Neon)
                                        # แก้ app = "<ชื่อที่ได้>" ใน fly.toml ให้ตรง

# ตั้ง secrets (production)
fly secrets set \
  DATABASE_URL="postgres://...neon.tech/...?sslmode=require" \
  JWT_SECRET="$(openssl rand -hex 32)" \
  CORS_ORIGIN="https://dreamxcodeding.github.io" \
  DEMO_MODE="true"     # true = ให้คนกดเข้า portal เดโม่ได้ · false = ปิด dev-assume-role

fly deploy                             # build Dockerfile + รัน (migrate อัตโนมัติตอน boot)

# seed ข้อมูล CNX ครั้งเดียว
fly ssh console -C "bun run src/seed.ts"

fly status                             # ได้ URL เช่น https://eventx-api.fly.dev
curl https://<app>.fly.dev/health      # ควรได้ {"success":true,...}
```

> **DEMO_MODE:** ตั้ง `true` ถ้าอยากให้คนเปิดเดโม่ลองทุก portal (agent/organizer/admin) ได้ —
> ข้อมูลติดต่อผู้สมัครจริงใน `/admin/users` ถูก mask แล้ว · ตั้ง `false` เพื่อปิดทางลัด role ใน production จริง

## 3) ชี้เดโม่ (GitHub Pages) มาที่ API จริง
build เว็บด้วย env ของ production แล้ว redeploy gh-pages (ใน **PowerShell** — ดู memory `ecn-demo-deploy`):
```powershell
cd apps/web
$env:VITE_USE_MOCK = "false"
$env:VITE_API_BASE = "https://<app>.fly.dev/api/v1"
bunx vite build --base=/eventx-demo/
$env:VITE_USE_MOCK = $null; $env:VITE_API_BASE = $null   # เคลียร์ env หลัง build
Copy-Item dist/index.html dist/404.html -Force
# ... push gh-pages ตามขั้นตอนใน memory ecn-demo-deploy
```
ตรวจ: `Select-String 'fly.dev' dist/assets/*.js` ต้องเจอ (เดโม่จะต่อ API จริงแทน mock)

## Rollback กลับเป็น mock
build ใหม่โดย **ไม่ตั้ง** `VITE_*` (ค่า default → `USE_MOCK=true`) แล้ว push gh-pages

## หมายเหตุ
- migration รันอัตโนมัติทุก deploy (idempotent) · seed รันเองครั้งเดียว
- rate limit: OTP 6/นาที/IP, auth 10/นาที/IP (กัน abuse — in-memory ต่อ instance)
- Railway ก็ใช้ Dockerfile เดียวกันได้ (ตั้ง env vars ชุดเดียวกัน)
