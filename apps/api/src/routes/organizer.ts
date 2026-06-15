// Organizer: งาน + ยอดขายจริง (sold/checkedIn คำนวณจาก tickets) · role ORGANIZER/ADMIN
import { Hono } from "hono";
import { all } from "../db.ts";
import { ok } from "../lib/response.ts";
import { requireAuth, requireRole, type JwtUser } from "../lib/auth.ts";
import type { Env } from "../env.ts";

const r = new Hono<{ Variables: { user: JwtUser }; Bindings: Env }>();
r.use("*", requireAuth);
r.use("*", requireRole("ORGANIZER", "ADMIN"));

const FEE_BPS = 700; // ค่าดำเนินการ ECN 7% (demo — ตรง ORGANIZER mock)

type EventSalesRow = {
  id: string; slug: string; title: string; date_label: string | null;
  price_from: number; quota: number; status: string; sold: number; checked_in: number;
};
const SALES_SQL = `
  select e.id, e.slug, e.title, e.date_label, e.price_from, e.quota, e.status,
    (select count(*)::int from tickets t where t.event_id = e.id) as sold,
    (select count(*)::int from tickets t where t.event_id = e.id and t.status = 'CHECKED_IN') as checked_in
  from events e order by e.created_at desc`;

const toSales = (e: EventSalesRow) => ({
  id: e.id, slug: e.slug, title: e.title, dateLabel: e.date_label ?? "",
  price: e.price_from, quota: e.quota, sold: e.sold, checkedIn: e.checked_in,
  status: e.status === "ON_SALE" ? "ON_SALE" : "ENDED",
  revenue: e.price_from * e.sold,
});

// GET /organizer/events — งานพร้อมยอดขายจริง
r.get("/events", async (c) => {
  const rows = await all<EventSalesRow>(SALES_SQL);
  return ok(c, rows.map(toSales));
});

// GET /organizer/dashboard — สรุปยอดรวม + ค่าดำเนินการ + ยอดสุทธิ
r.get("/dashboard", async (c) => {
  const rows = await all<EventSalesRow>(SALES_SQL);
  const sold = rows.reduce((n, e) => n + e.sold, 0);
  const checkedIn = rows.reduce((n, e) => n + e.checked_in, 0);
  const revenue = rows.reduce((n, e) => n + e.price_from * e.sold, 0);
  const fee = Math.floor((revenue * FEE_BPS) / 10000);
  return ok(c, { events: rows.length, totalSold: sold, totalCheckedIn: checkedIn, revenue, feeBps: FEE_BPS, fee, net: revenue - fee });
});

export default r;
