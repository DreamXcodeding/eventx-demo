-- EventX schema (SQLite / bun:sqlite) — รันด้วย bun run migrate
-- id เป็น TEXT random hex, เวลาเป็น TEXT ISO (datetime('now')), jsonb→TEXT(json string)

create table if not exists users (
  id          text primary key default (lower(hex(randomblob(16)))),
  name        text not null,
  email       text,
  phone       text unique,
  role        text not null default 'CUSTOMER',
  created_at  text not null default (datetime('now'))
);

create table if not exists events (
  id            text primary key default (lower(hex(randomblob(16)))),
  slug          text unique not null,
  title         text not null,
  subtitle      text,
  presenter     text,
  province      text,
  venue         text,
  location_label text,
  date_label    text,
  time_label    text,
  category      text not null default 'festival',
  accent        text not null default 'lantern',
  status        text not null default 'ON_SALE',
  rating        real default 0,
  reviews       integer default 0,
  price_from    integer not null default 0,
  image         text,
  description   text,
  badge         text,
  created_at    text not null default (datetime('now'))
);

create table if not exists event_highlights (
  id text primary key default (lower(hex(randomblob(16)))),
  event_id text not null references events(id) on delete cascade,
  icon text, title text not null, "desc" text, sort integer default 0
);
create table if not exists event_sessions (
  id text primary key default (lower(hex(randomblob(16)))),
  event_id text not null references events(id) on delete cascade,
  code text not null, label text not null, date_label text, sort integer default 0
);
create table if not exists ticket_types (
  id text primary key default (lower(hex(randomblob(16)))),
  event_id text not null references events(id) on delete cascade,
  code text not null, kind text not null default 'STANDARD',
  name text not null, price integer not null, perks text not null default '[]', badge text, sort integer default 0
);
create table if not exists event_faq (
  id text primary key default (lower(hex(randomblob(16)))),
  event_id text not null references events(id) on delete cascade,
  q text not null, a text not null, sort integer default 0
);
create table if not exists event_terms (
  id text primary key default (lower(hex(randomblob(16)))),
  event_id text not null references events(id) on delete cascade,
  text text not null, sort integer default 0
);
create table if not exists event_gallery (
  id text primary key default (lower(hex(randomblob(16)))),
  event_id text not null references events(id) on delete cascade,
  url text not null, sort integer default 0
);

create table if not exists affiliates (
  id text primary key default (lower(hex(randomblob(16)))),
  code text unique not null,
  user_id text references users(id) on delete set null,
  name text not null, channel text, rate_bps integer not null default 1000,
  created_at text not null default (datetime('now'))
);

create table if not exists orders (
  id text primary key default (lower(hex(randomblob(16)))),
  order_no text unique not null,
  user_id text references users(id) on delete set null,
  status text not null default 'PENDING',
  subtotal integer not null default 0,
  affiliate_code text,
  buyer_name text, buyer_email text, buyer_phone text,
  channel text not null default 'DIRECT',
  created_at text not null default (datetime('now')),
  expires_at text,
  paid_at text
);
create table if not exists order_items (
  id text primary key default (lower(hex(randomblob(16)))),
  order_id text not null references orders(id) on delete cascade,
  ticket_type_id text references ticket_types(id) on delete set null,
  event_id text references events(id) on delete set null,
  event_title text not null, ticket_name text not null, session_label text,
  unit_price integer not null, quantity integer not null
);
create table if not exists tickets (
  id text primary key default (lower(hex(randomblob(16)))),
  ticket_no text unique not null,
  order_id text not null references orders(id) on delete cascade,
  user_id text references users(id) on delete set null,
  event_id text references events(id) on delete set null,
  event_title text not null, event_image text, ticket_name text not null, session_label text,
  qr text not null,
  status text not null default 'ISSUED',
  issued_at text not null default (datetime('now')),
  checked_in_at text
);
create table if not exists commissions (
  id text primary key default (lower(hex(randomblob(16)))),
  affiliate_code text not null,
  order_id text references orders(id) on delete set null,
  order_no text not null, event_title text,
  base integer not null, amount integer not null,
  status text not null default 'PENDING',
  created_at text not null default (datetime('now'))
);

create table if not exists referral_clicks (
  id text primary key default (lower(hex(randomblob(16)))),
  code text not null,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_affcode on orders(affiliate_code);
create index if not exists idx_refclicks_code on referral_clicks(code);
create index if not exists idx_tickets_user on tickets(user_id);
create index if not exists idx_tickets_no on tickets(ticket_no);
create index if not exists idx_commissions_code on commissions(affiliate_code);
