# EventX API (Bun + Hono + PostgreSQL)

Backend สำหรับ EventX demo — REST API ที่ `/api/v1`, error format มาตรฐาน, JWT auth.

## ตั้งค่า (local)

1. คัดลอก env: `cp .env.example .env` แล้วเติม `DATABASE_URL` (Postgres) + `JWT_SECRET`
   - ยังไม่มี Postgres? สมัคร **Neon** ฟรี (neon.tech) → คัดลอก connection string มาใส่ `DATABASE_URL`
2. ติดตั้ง: `bun install`
3. สร้างตาราง: `bun run migrate`
4. ใส่ข้อมูล demo (งาน CNX): `bun run seed`
5. รัน: `bun run dev` → API ที่ http://localhost:3000

## ต่อกับ frontend (apps/web)

ตั้ง env ใน `apps/web/.env`:
```
VITE_USE_MOCK=false
VITE_API_BASE=http://localhost:3000/api/v1
```
แล้ว `bun run dev` ฝั่ง web — จะเรียก API จริงแทน mock

## Endpoints (Phase 1)

| method | path | auth | ใช้ทำอะไร |
|---|---|---|---|
| GET  | /health | - | health check |
| POST | /api/v1/auth/request-otp | - | ขอ OTP (demo) |
| POST | /api/v1/auth/verify-otp | - | ยืนยัน OTP → token |
| POST | /api/v1/auth/register | - | สมัครสมาชิก → token |
| POST | /api/v1/auth/social | - | login Google/email (demo) |
| GET  | /api/v1/auth/me | ✓ | โปรไฟล์ปัจจุบัน |
| GET  | /api/v1/events | - | รายการอีเวนต์ (การ์ด) |
| GET  | /api/v1/events/:slug | - | รายละเอียดอีเวนต์เต็ม |

Phase 2: orders/checkout, tickets+QR, check-in, affiliate · Phase 3: agent/organizer/admin
