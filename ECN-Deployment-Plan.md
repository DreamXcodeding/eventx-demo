# ECN — Deployment Plan (ตัวเลือกเบา / Lean Stack)

แผนนี้เน้น **เริ่มเร็ว ถูกตอนเริ่ม ขยายได้ทีหลังโดยไม่ต้องรื้อ** สำหรับ stack: Bun + Hono + React/Vite + PostgreSQL

---

## 1. สรุปชุดเครื่องมือ

| ชั้น | บริการที่เลือก | ทำไม | ค่าใช้จ่ายช่วงเริ่ม |
|------|----------------|------|---------------------|
| Frontend | **Cloudflare Pages** | CDN ทั่วโลก, free tier ใจกว้าง, ดีกับลูกค้าต่างประเทศ | ฟรี |
| Backend | **Railway** | รองรับ Dockerfile/Bun, deploy จาก GitHub, log ง่าย | ~$5/mo เริ่มต้น |
| Database | **Neon** (Postgres) | serverless, pooling ในตัว, แยก branch ต่อ env | ฟรี → ~$19/mo |
| File Storage | **Cloudflare R2** | ไม่มีค่า egress (โหลดรูป/ตั๋วเยอะไม่บานปลาย) | ฟรี 10GB |
| Email (ตั๋ว) | **Resend** หรือ **Brevo** | API ง่าย, deliverability ดี, free tier | ฟรี → จ่ายตามปริมาณ |
| Payment | PromptPay/Card ผ่าน **Omise** หรือ **2C2P** | รองrับ PromptPay + บัตร + ต่างประเทศ | คิดตาม transaction |

> Alipay/WeChat: 2C2P หรือ Omise รองรับ ถ้าเน้นตลาดจีนค่อยเพิ่ม gateway เฉพาะทางทีหลัง

---

## 2. โครงสร้าง Environment

แยก 3 ชั้น ใช้สถาปัตยกรรมเดียวกัน ต่างแค่ค่า env:

```
LOCAL (dev)          STAGING                PRODUCTION
─────────────        ─────────────          ─────────────
Bun รันเครื่องตัวเอง    Railway (staging)       Railway (prod)
Postgres ใน Docker    Neon branch: staging    Neon branch: main
Vite dev server      CF Pages (preview)      CF Pages (prod domain)
R2 bucket: dev        R2 bucket: staging      R2 bucket: prod
```

**หลักการ:** local dev รัน Postgres ใน Docker (ไม่ต่อ cloud) เพื่อความเร็ว + ไม่เปลือง quota ใช้ managed DB เฉพาะ staging/prod เท่านั้น

Neon มีฟีเจอร์ **database branching** — แตก branch จาก prod มาเป็น staging ได้ทันที ข้อมูล schema ตรงกัน ทดสอบ migration ได้ปลอดภัยก่อนขึ้น prod

---

## 3. โครงสร้าง Repo (Monorepo)

```
ecn/
├── apps/
│   ├── web/          # React + Vite (frontend)
│   └── api/          # Bun + Hono (backend)
├── packages/
│   ├── db/           # schema + migration (Drizzle)
│   └── shared/       # zod schema, types ใช้ร่วม 2 ฝั่ง
├── docker-compose.yml  # Postgres สำหรับ local dev
├── .env.example
└── README.md
```

`packages/shared` คือหัวใจ — เก็บ zod schema และ TypeScript type ที่ frontend กับ backend ใช้ร่วมกัน ทำให้ type ตรงกันทั้งระบบ (ตรงกับเกณฑ์ production-ready ที่วางไว้)

---

## 4. การจัดการ Secrets / Env

- **Local:** ไฟล์ `.env` (อยู่ใน `.gitignore`), commit แต่ `.env.example`
- **Railway/Neon/CF:** ตั้ง env variable ใน dashboard ของแต่ละบริการ ไม่เก็บใน repo
- **ห้าม** hardcode secret หรือ connection string ในโค้ดเด็ดขาด
- Key ที่ต้องแยกต่อ env: `DATABASE_URL`, `JWT_SECRET`, payment gateway key, R2 credentials, email API key

---

## 5. CI/CD (เริ่มแบบเบา)

ใช้ **GitHub Actions** + auto-deploy ของแต่ละ platform:

```
push → branch `develop`  →  deploy staging อัตโนมัติ
push → branch `main`      →  deploy production อัตโนมัติ
PR เปิด                    →  CF Pages สร้าง preview URL ให้ทดสอบ
```

Pipeline ขั้นต่ำใน GitHub Actions:
1. `bun install`
2. `bun run typecheck` (tsc --noEmit)
3. `bun test`
4. `bun run build`
5. (ถ้าผ่าน) platform ดึงไป deploy เอง

Migration รันแยกก่อน deploy: `bun run db:migrate` ชี้ไปที่ Neon branch ของ env นั้น

---

## 6. ลำดับลงมือ (แนะนำ)

1. ตั้ง monorepo + docker-compose (Postgres local) ให้รันได้บนเครื่องก่อน
2. ต่อ Drizzle + เขียน migration จาก data model ที่ออกแบบไว้
3. ทำ backend `/health` + auth endpoint ขึ้น Railway ให้ deploy ได้จริง 1 รอบ
4. ต่อ Neon (staging) แล้วลอง migrate ขึ้น cloud
5. ขึ้น frontend เปล่า ๆ บน CF Pages เชื่อม API
6. ค่อยไล่ทำฟีเจอร์ตาม MVP scope

> ทำ "deploy ทะลุจาก local → cloud ให้ได้ 1 รอบก่อน" ตั้งแต่ยังไม่มีฟีเจอร์ — จะเจอปัญหา infra เร็ว แก้ตอนระบบยังเล็ก ง่ายกว่ามาก

---

## 7. เมื่อไหร่ค่อยย้ายไป GCP/AWS

สัญญาณที่บอกว่าควรพิจารณาย้าย (ยังไม่ใช่ตอนนี้):
- traffic เกินที่ Railway รับไหว หรือค่าใช้จ่ายเริ่มสูงกว่า cloud ใหญ่
- ต้องการ region ในไทย/เอเชียแบบเจาะจงเพื่อลด latency
- ต้องใช้บริการเฉพาะ (BigQuery, ML, queue ขนาดใหญ่)

เพราะทุกอย่างอยู่ใน Docker + Postgres มาตรฐาน การย้ายไป Cloud Run + Cloud SQL ทำได้โดยไม่ต้องเขียนโค้ดใหม่ — แค่เปลี่ยนปลายทาง deploy กับ connection string
