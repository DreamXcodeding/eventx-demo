-- EventX Phase 3 (PostgreSQL) — agent bookings, organizer applications, admin internal events
-- + quota บน events สำหรับ organizer dashboard

alter table events add column if not exists quota integer not null default 0;

-- ใบสมัคร organizer (PARTNER) ที่แอดมินพิจารณา
create table if not exists organizer_apps (
  id text primary key default gen_random_uuid()::text,
  company text not null,
  contact text not null,
  phone text,
  requested_tickets integer not null default 0,
  fee_bps integer,                               -- null = ยังไม่ตั้งค่าดำเนินการ
  status text not null default 'DISCUSSING',     -- DISCUSSING | APPROVED | REJECTED
  user_id text references users(id) on delete set null,
  applied_at timestamptz not null default now()
);

-- booking ที่ agent ออกให้ลูกค้า (บันทึกอย่างเดียว — ไม่มี payment/commission)
create table if not exists agent_bookings (
  id text primary key default gen_random_uuid()::text,
  booking_no text unique not null,
  agent_id text references users(id) on delete set null,
  event_id text references events(id) on delete set null,
  event_title text not null,
  ticket_name text not null,
  session_label text,
  qty integer not null,
  amount integer not null,
  customer_name text not null,
  customer_email text,
  created_at timestamptz not null default now()
);

-- อีเวนต์ที่แอดมินลงเอง (INTERNAL) — แยกจาก marketplace events
create table if not exists admin_events (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  province text,
  category text not null default 'festival',
  date_label text,
  price_from integer not null default 0,
  source text not null default 'INTERNAL',
  status text not null default 'DRAFT',           -- DRAFT | PUBLISHED
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_bookings_agent on agent_bookings(agent_id);
create index if not exists idx_organizer_apps_status on organizer_apps(status);
