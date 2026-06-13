# ECN — Technical Design (Phase 1 / MVP)

เอกสารนี้ต่อยอดจาก ECN Vision Doc โดยเติมชั้น **how** ที่จำเป็นก่อนเขียนโค้ด: data model, state machine ของ order/payment/ticket และ money rules (commission / settlement / refund)

> **สถานะ:** Draft v0.1 — เขียนเพื่อให้ทีมเริ่ม implement ได้จริง สมมติฐานที่ยังไม่ยืนยันถูกทำเครื่องหมาย ⚠️ ไว้

---

## 0. สมมติฐานหลัก (ต้องยืนยันกับ business)

| # | ประเด็น | ค่าที่ยืนยันแล้ว / default | ทำไม |
|---|---------|------------------------------|------|
| A1 | **Agent กับ Organizer ดีลเงินกันเองนอกระบบ** | ✅ ยืนยันแล้ว — ECN ไม่ยุ่งกับเงิน Agent | ECN เป็นแค่ระบบออกตั๋ว + เก็บ record สำหรับ booking_type = AGENT |
| A2 | Affiliate commission ล็อกเมื่อไหร่ | ตอน `order.PAID` (เฉพาะ DIRECT/AFFILIATE) | กันการนับ commission จาก order ที่ยังไม่จ่าย |
| A3 | Affiliate commission จ่ายจริงเมื่อไหร่ | ตอน settlement (หลังจบ event / รอบจ่าย) | กัน fraud จองแล้วยกเลิก |
| A4 | สกุลเงิน | THB เท่านั้นใน MVP | Alipay/WeChat รับชำระได้แต่ settle เป็น THB |
| A5 | หน่วยเงินใน DB | เก็บเป็น **สตางค์ (integer)** | กัน floating point error |
| A6 | Inventory ระดับไหน | quota ต่อ `ticket_type` (ไม่ใช่ที่นั่งระบุเลข) | MVP ส่วนใหญ่เป็น general admission |
| A7 | QR ปลอดภัยอย่างไร | signed JWT ฝังใน QR + server-side single-use check | กันปลอม + กันใช้ซ้ำ |

> **สำคัญ — Agent flow ไม่เกี่ยวกับเงินในระบบ ECN:** Agent เก็บเงินสดจากลูกค้าเอง และเคลียร์เงินกับ Organizer กันเองนอกระบบ ECN ทำหน้าที่แค่ (1) รับข้อมูลลูกค้า + รหัส Agent (2) ออกตั๋วจริงให้ลูกค้า + ตั๋ว copy ให้ Agent (3) เก็บ record ดังนั้น **ไม่มี Payment, Commission, Invoice หรือ Settlement สำหรับ booking_type = AGENT** Agent order ออกตั๋วได้ทันทีโดยไม่ต้องรอจ่าย

---

# PART 1 — DATA MODEL (ERD)

## 1.1 ภาพรวมความสัมพันธ์

```
User ──< Order >── Event ──< Session
 │         │         │
 │         │         └──< TicketType ──< Ticket
 │         ├──< OrderItem
 │         ├── Payment
 │         └── Commission ──> Settlement
 │
 ├── (role: AGENT)    ──< Order (agent_id)
 ├── (role: AFFILIATE)──< ReferralLink ──< Order (affiliate_id)
 └── (role: ORGANIZER)──< Event
```

## 1.2 Entity หลัก

### User
ตารางเดียวรองรับทุก role (role-based) — เก็บ flag role ไว้ใน `roles` (array) เพราะคนหนึ่งอาจเป็นได้หลาย role

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| email | citext unique | |
| password_hash | text | argon2 |
| full_name | text | |
| phone | text | |
| roles | text[] | `['CUSTOMER']`, `['AGENT']`, ... |
| company_name | text null | สำหรับ agent |
| status | enum | `ACTIVE / SUSPENDED` |
| created_at / updated_at | timestamptz | |

### Event

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| organizer_id | uuid (fk → user) | |
| title, description | text | |
| province, category | text | สำหรับ filter |
| banner_url, gallery (jsonb) | | |
| status | enum | `DRAFT / PENDING / APPROVED / PUBLISHED / ARCHIVED / REJECTED` |
| approved_by | uuid null | admin ที่อนุมัติ |
| created_at / updated_at | timestamptz | |

### Session
รอบการแสดง/วันจัด — event มีได้หลายรอบ

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| event_id | uuid (fk) | |
| starts_at / ends_at | timestamptz | |
| venue_name | text | |

### TicketType
ชนิดบัตร + ราคา + quota (จุดควบคุม inventory)

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| event_id | uuid (fk) | |
| session_id | uuid null (fk) | null = ใช้ได้ทุกรอบ |
| name | enum/text | VIP / Premium / Standard / Group / Early Bird / Complimentary |
| price_satang | integer | A5 — เก็บเป็นสตางค์ |
| quota | integer | จำนวนที่เปิดขาย |
| sold | integer | จำนวนที่ขายแล้ว (ดู 1.3 เรื่อง oversell) |
| sales_starts_at / sales_ends_at | timestamptz null | สำหรับ Early Bird |
| max_per_order | integer | จำกัดต่อ order |

### Order
หัวบิล — แกนกลางของ booking type

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| order_no | text unique | เลขที่อ่านได้ เช่น `ECN-2026-000123` |
| booking_type | enum | `DIRECT / AGENT / AFFILIATE` |
| customer_id | uuid (fk → user) | ลูกค้าที่ถือบัตร |
| agent_id | uuid null (fk → user) | กรอกเมื่อ AGENT |
| affiliate_id | uuid null (fk → user) | กรอกเมื่อ AFFILIATE |
| referral_link_id | uuid null (fk) | |
| event_id | uuid (fk) | |
| status | enum | ดู Part 2 (Agent order ข้าม PENDING/PAID ไป COMPLETED เลย) |
| subtotal_satang | integer | |
| discount_satang | integer | จาก coupon (เฉพาะ DIRECT/AFFILIATE) |
| total_satang | integer | DIRECT/AFFILIATE = ยอดจ่ายจริง · AGENT = ยอดบันทึกไว้เฉย ๆ (ไม่มีการเก็บเงินในระบบ) |
| coupon_code | text null | |
| expires_at | timestamptz null | เวลา hold หมดอายุ — **null สำหรับ AGENT** (ไม่ต้องรอจ่าย ดู Part 2) |
| created_at / updated_at | timestamptz | |

> **Agent order:** `agent_id` มีค่า, `payment` ไม่ถูกสร้าง, `commission` ไม่ถูกสร้าง ระบบบันทึก `total_satang` ไว้เป็นข้อมูลอ้างอิง/รายงานเท่านั้น (โชว์ใน Agent Portal → Outstanding ซึ่งเป็นยอดที่ Agent ต้องไปเคลียร์กับ Organizer เอง ไม่ใช่ยอดที่ ECN เก็บ)

### OrderItem
รายการบัตรใน order (1 order มีได้หลาย ticket type)

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| order_id | uuid (fk) | |
| ticket_type_id | uuid (fk) | |
| quantity | integer | |
| unit_price_satang | integer | snapshot ราคา ณ เวลาซื้อ |

### Payment
1 order = 1 payment (MVP ไม่รองรับจ่ายแยกหลายครั้ง) — **สร้างเฉพาะ booking_type = DIRECT หรือ AFFILIATE** Agent order ไม่มี payment record

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| order_id | uuid (fk) unique | |
| provider | enum | `PROMPTPAY / CARD / ALIPAY / WECHAT` |
| provider_ref | text | reference จาก gateway |
| amount_satang | integer | |
| status | enum | ดู Part 2 |
| idempotency_key | text unique | กัน webhook ซ้ำ (ดู Part 2) |
| paid_at | timestamptz null | |

### Ticket
บัตรราย "ใบ" — สร้างเมื่อ order ถึงสถานะออกตั๋วได้ (DIRECT/AFFILIATE = หลัง payment สำเร็จ · AGENT = ทันทีที่ Agent ยืนยัน booking)

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| order_id | uuid (fk) | |
| ticket_type_id | uuid (fk) | |
| session_id | uuid (fk) | |
| holder_name | text | |
| qr_token | text unique | signed JWT (A7) |
| status | enum | `ISSUED / CHECKED_IN / VOID / REFUNDED` |
| checked_in_at | timestamptz null | |
| checked_in_by | uuid null | staff ที่สแกน |

### ReferralLink (Affiliate)

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| affiliate_id | uuid (fk) | |
| event_id | uuid null (fk) | null = ทุก event |
| code | text unique | เช่น `AFF001` |
| clicks | integer | นับ click |

### Commission
บันทึก commission ต่อ order — **เฉพาะ booking_type = AFFILIATE** สร้างตอน order.PAID (A2) Agent ไม่มี commission ในระบบ (Agent ได้กำไรจากส่วนต่างที่ดีลกับ Organizer เอง)

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| order_id | uuid (fk) unique | |
| beneficiary_id | uuid (fk → user) | affiliate |
| base_satang | integer | ฐานที่ใช้คำนวณ |
| rate_bps | integer | อัตรา หน่วย basis point (100 bps = 1%) |
| amount_satang | integer | base × rate |
| status | enum | `PENDING / REVERSED / SETTLED` |
| settlement_id | uuid null (fk) | |

### Settlement
รอบจ่ายเงินให้ organizer / affiliate (**ไม่มี Agent** — Agent เคลียร์เงินกับ Organizer เองนอกระบบ)

| field | type | note |
|-------|------|------|
| id | uuid (pk) | |
| beneficiary_id | uuid (fk) | |
| beneficiary_role | enum | `ORGANIZER / AFFILIATE` |
| period_start / period_end | date | รอบจ่าย |
| gross_satang | integer | ยอดก่อนหัก |
| fee_satang | integer | ค่าธรรมเนียม platform |
| net_satang | integer | ยอดโอนจริง |
| status | enum | `DRAFT / APPROVED / PAID` |
| approved_by | uuid null | admin |
| paid_at | timestamptz null | |

## 1.3 จุดควบคุม oversell (สำคัญมาก)

ห้ามใช้ `SELECT sold; if sold < quota then UPDATE` แบบธรรมดา เพราะ race condition ตอนคนแย่งซื้อ ให้ใช้ **atomic conditional update** บน `ticket_type`:

```sql
UPDATE ticket_type
SET sold = sold + $qty
WHERE id = $id AND sold + $qty <= quota
RETURNING sold;
```

ถ้า `RETURNING` ไม่คืนแถว = quota ไม่พอ → reject ทันที การ +sold ทำตอนสร้าง order (hold) ไม่ใช่ตอนจ่าย และถ้า order หมดอายุ/ยกเลิก ต้อง `sold = sold - qty` คืน (ดู Part 2)

---

# PART 2 — STATE MACHINES

## 2.1 Order status

**DIRECT / AFFILIATE** (ต้องจ่ายก่อนออกตั๋ว):

```
        ┌──────────────────────────────────────────┐
        │                                           ▼
   [PENDING] ──pay success──> [PAID] ──issue──> [COMPLETED]
        │                       │
        │                       └──refund req──> [REFUNDED]
        │
        ├──timeout (expires_at)──> [EXPIRED]   (คืน inventory)
        └──user cancel──────────> [CANCELLED]  (คืน inventory)
```

**AGENT** (ออกตั๋วทันที ไม่ผ่าน payment):

```
   [COMPLETED]   ← สร้าง order + ออกตั๋วในขั้นตอนเดียว
        │
        └──admin void──> [CANCELLED]  (คืน inventory + void ตั๋ว)
```

Agent order ไม่มี PENDING/PAID เพราะไม่มีการรอจ่าย — Agent ยืนยัน booking → ตัด inventory → ออกตั๋ว → COMPLETED ทันที ไม่มี hold timeout (`expires_at = null`)

| status | ความหมาย | inventory |
|--------|----------|-----------|
| PENDING | สร้างแล้ว รอจ่าย (hold inventory ไว้) — *DIRECT/AFFILIATE เท่านั้น* | จอง (sold +qty) |
| PAID | จ่ายสำเร็จ กำลังออกบัตร | คงจอง |
| COMPLETED | ออกบัตรครบแล้ว | คงจอง |
| EXPIRED | เกิน `expires_at` ยังไม่จ่าย | **คืน (sold -qty)** |
| CANCELLED | ยกเลิก/void | **คืน (sold -qty)** |
| REFUNDED | คืนเงินหลังจ่าย (*DIRECT/AFFILIATE*) | คืนตาม policy ⚠️ |

**Hold timeout:** ตั้ง `expires_at = now() + 15 นาที` ตอนสร้าง DIRECT/AFFILIATE order มี background job (หรือ lazy check ตอน query) เปลี่ยน PENDING ที่หมดอายุเป็น EXPIRED แล้วคืน inventory — ตรงกับ User State bar ใน mockup ("ภายใน 15 นาที → หมดเวลา")

## 2.2 Payment status

```
[INITIATED] ──webhook success──> [SUCCEEDED] ──> trigger order.PAID
     │
     ├──webhook fail──> [FAILED]
     └──no webhook (timeout)──> [EXPIRED]
```

**Idempotency (สำคัญ):** payment gateway มักส่ง webhook ซ้ำหรือสลับลำดับ ทุก webhook ต้องมี `idempotency_key` ถ้า key เคยประมวลผลแล้วให้ตอบ 200 เฉย ๆ ไม่ทำซ้ำ การเปลี่ยน order → PAID ต้องอยู่ใน transaction เดียวกับการบันทึก payment.SUCCEEDED

**กรณีจ่ายสำเร็จแต่ออกบัตรล้มเหลว:** order ค้างที่ PAID (ยังไม่ COMPLETED) → มี retry job ออกบัตรซ้ำได้ (idempotent ด้วย order_id) ห้ามถือว่า PAID = จบ

## 2.3 Ticket status

```
[ISSUED] ──scan at gate──> [CHECKED_IN]
   │
   ├──order refunded──> [REFUNDED]
   └──admin void──────> [VOID]
```

**Check-in single-use:** การสแกนต้องเป็น atomic update เช่นเดียวกับ inventory:

```sql
UPDATE ticket
SET status = 'CHECKED_IN', checked_in_at = now(), checked_in_by = $staff
WHERE id = $id AND status = 'ISSUED'
RETURNING id;
```

ไม่คืนแถว = เคยเช็คอินแล้ว/บัตรไม่ valid → แสดง "ใช้แล้ว" ที่หน้าจอสแกน QR token เป็น signed JWT ตรวจ signature ก่อนเสมอ กัน QR ปลอม

---

# PART 3 — MONEY RULES

## 3.1 Commission (เฉพาะ Affiliate)

> Agent ไม่มี commission ในระบบ — Agent รับเงินจากลูกค้าและเคลียร์กับ Organizer เองนอก ECN

**Affiliate**
- อัตรา: กำหนดต่อ event (`rate_bps`) default ⚠️ 500 bps (5%) — mockup โชว์ "10% จากทุกการขาย" จึงควรยืนยันเลขจริง
- ฐานคำนวณ: `order.total_satang` (หลังหักส่วนลด) ⚠️ ยืนยันว่าคิดจาก net หรือ subtotal
- เงื่อนไขผูก: order ต้องมี `referral_link_id` และ link ยัง valid
- attribution window: ⚠️ click → purchase ภายใน 30 วัน (เก็บ cookie/last-click)

**ตอน `order.PAID`** (เฉพาะ AFFILIATE) → สร้าง record `commission` status = `PENDING`
สูตร: `amount_satang = floor(base_satang × rate_bps / 10000)`

## 3.2 Refund → commission reversal

| สถานะ commission ตอน refund | การจัดการ |
|------------------------------|-----------|
| PENDING (ยังไม่ settle) | เปลี่ยนเป็น `REVERSED` ไม่จ่าย |
| SETTLED (จ่ายไปแล้ว) | ⚠️ บันทึกเป็น clawback / หักรอบถัดไป — ต้องมี business rule |

นี่คือเหตุผลที่ A3 เลือกจ่าย commission ตอน settlement ไม่ใช่ตอน paid — ลดเคส SETTLED-แล้ว-ต้อง-clawback

## 3.3 Settlement

รอบจ่าย (⚠️ default รายสัปดาห์ หรือหลังจบ event):

1. รวบรวมรายการที่ status เหมาะสมในช่วง period
   - **Organizer:** ยอดขายบัตรของ event ตนเอง เฉพาะ order ที่ ECN เก็บเงินจริง (DIRECT/AFFILIATE ที่ COMPLETED) ลบ refund — **ไม่รวม Agent order** เพราะ ECN ไม่ได้เก็บเงินก้อนนั้น (Agent จ่าย Organizer เอง)
   - **Affiliate:** commission ที่ status = PENDING
2. คำนวณ
   - `gross_satang` = ผลรวมข้างต้น
   - `fee_satang` = ค่าธรรมเนียม platform (⚠️ default organizer 700 bps / 7%)
   - `net_satang = gross - fee`
3. สร้าง settlement status = `DRAFT`
4. Admin ตรวจ → `APPROVED`
5. โอนเงินจริง (manual/bank file ใน MVP) → `PAID` + อัปเดต commission ที่เกี่ยวข้องเป็น `SETTLED`

ทุกการคำนวณเงินทำบน integer (สตางค์) ปัดเศษด้วย `floor` ทิศทางเดียวเสมอ กัน rounding drift

## 3.4 หลักการเงินที่ห้ามพลาด

- เก็บทุกจำนวนเงินเป็น **integer สตางค์** ไม่ใช่ float/decimal ใน JS
- `unit_price` ใน OrderItem เป็น **snapshot** — ถ้า organizer แก้ราคาทีหลัง order เก่าต้องไม่เปลี่ยน
- ทุก mutation ที่แตะเงิน/inventory อยู่ใน DB transaction
- มี `idempotency_key` ทุกจุดที่รับ event จากภายนอก (payment webhook)

---

# ภาคผนวก — สิ่งที่ยังต้องตัดสินใจก่อนเริ่มจริง

1. ~~Agent model~~ ✅ ยืนยันแล้ว — Agent/Organizer ดีลกันเอง ECN ไม่ยุ่งเรื่องเงิน Agent
2. Refund policy — เต็มจำนวน / มี cut-off กี่วันก่อน event / หักค่าธรรมเนียม (ยังไม่มีใน vision doc)
3. Commission rate + fee จริง (placeholder อยู่ 5% / 7%; mockup เขียน 10% — ต้องเลือก)
4. Tax / ใบกำกับภาษี — อยู่ Phase ไหน
5. Multi-currency — ยืนยันว่า MVP THB อย่างเดียว
6. Coupon — ใครออกได้ (organizer/admin), คิดก่อนหรือหลัง commission base
7. **Agent order แก้ไข/ยกเลิกได้แค่ไหน** — Agent กรอกผิด (เช่น email ลูกค้าผิด) แก้เองได้ หรือต้องผ่าน admin? ตั๋วที่ส่งไปแล้วต้อง re-issue ยังไง
8. **Agent ดูได้แค่ลูกค้าตัวเอง** — authz: Agent A ต้องไม่เห็น booking ของ Agent B (Agent Portal → Customer Management)
