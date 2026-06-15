// Admin: organizer applications, internal events, users, platform dashboard · role ADMIN
import { Hono } from "hono";
import { all, get, run } from "../db.ts";
import { ok, ApiError } from "../lib/response.ts";
import { requireAuth, requireRole, type JwtUser } from "../lib/auth.ts";
import { approveOrganizerSchema, adminEventSchema } from "../schemas.ts";
import type { Env } from "../env.ts";

const r = new Hono<{ Variables: { user: JwtUser }; Bindings: Env }>();
r.use("*", requireAuth);
r.use("*", requireRole("ADMIN"));

// ── organizer applications ───────────────────────────────────────
type OrgRow = { id: string; company: string; contact: string; phone: string | null; requested_tickets: number; fee_bps: number | null; status: string; applied_at: string | Date };
const toOrg = (o: OrgRow) => ({
  id: o.id, company: o.company, contact: o.contact, phone: o.phone ?? "",
  requestedTickets: o.requested_tickets, feeBps: o.fee_bps, status: o.status, appliedAt: new Date(o.applied_at).getTime(),
});

r.get("/organizers", async (c) => {
  const rows = await all<OrgRow>("select id, company, contact, phone, requested_tickets, fee_bps, status, applied_at from organizer_apps order by applied_at desc");
  return ok(c, rows.map(toOrg));
});

r.post("/organizers/:id/approve", async (c) => {
  const { feeBps } = approveOrganizerSchema.parse(await c.req.json());
  const id = c.req.param("id");
  if (!(await get("select 1 as x from organizer_apps where id = ?", id))) throw new ApiError(404, "NOT_FOUND", "ไม่พบใบสมัคร");
  await run("update organizer_apps set status = 'APPROVED', fee_bps = ? where id = ?", feeBps, id);
  return ok(c, toOrg((await get<OrgRow>("select id, company, contact, phone, requested_tickets, fee_bps, status, applied_at from organizer_apps where id = ?", id))!));
});

r.post("/organizers/:id/reject", async (c) => {
  const id = c.req.param("id");
  if (!(await get("select 1 as x from organizer_apps where id = ?", id))) throw new ApiError(404, "NOT_FOUND", "ไม่พบใบสมัคร");
  await run("update organizer_apps set status = 'REJECTED' where id = ?", id);
  return ok(c, toOrg((await get<OrgRow>("select id, company, contact, phone, requested_tickets, fee_bps, status, applied_at from organizer_apps where id = ?", id))!));
});

// ── internal events ──────────────────────────────────────────────
type AdminEventRow = { id: string; title: string; province: string | null; category: string; date_label: string | null; price_from: number; source: string; status: string; created_at: string | Date };
const toAdminEvent = (e: AdminEventRow) => ({
  id: e.id, title: e.title, province: e.province ?? "", category: e.category, dateLabel: e.date_label ?? "",
  priceFrom: e.price_from, source: e.source, status: e.status, createdAt: new Date(e.created_at).getTime(),
});
const EVENT_COLS = "id, title, province, category, date_label, price_from, source, status, created_at";

r.get("/events", async (c) => {
  const rows = await all<AdminEventRow>(`select ${EVENT_COLS} from admin_events order by created_at desc`);
  return ok(c, rows.map(toAdminEvent));
});

r.post("/events", async (c) => {
  const b = adminEventSchema.parse(await c.req.json());
  const id = crypto.randomUUID();
  await run("insert into admin_events (id, title, province, category, date_label, price_from) values (?,?,?,?,?,?)",
    id, b.title, b.province ?? null, b.category ?? "festival", b.dateLabel ?? null, b.priceFrom);
  return ok(c, toAdminEvent((await get<AdminEventRow>(`select ${EVENT_COLS} from admin_events where id = ?`, id))!), 201);
});

r.post("/events/:id/publish", async (c) => {
  const id = c.req.param("id");
  if (!(await get("select 1 as x from admin_events where id = ?", id))) throw new ApiError(404, "NOT_FOUND", "ไม่พบอีเวนต์");
  await run("update admin_events set status = 'PUBLISHED' where id = ?", id);
  return ok(c, toAdminEvent((await get<AdminEventRow>(`select ${EVENT_COLS} from admin_events where id = ?`, id))!));
});

// ── users ────────────────────────────────────────────────────────
const maskEmail = (e: string) => e.replace(/^(.{1,3}).*(@.*)$/, "$1•••$2");
const maskPhone = (p: string) => (p.length >= 6 ? `${p.slice(0, 3)}•••${p.slice(-2)}` : p);

r.get("/users", async (c) => {
  const rows = await all<{ id: string; name: string; email: string | null; phone: string | null; role: string; created_at: string | Date }>(
    "select id, name, email, phone, role, created_at from users order by created_at desc limit 200");
  // mask PII — แอดมินดูภาพรวมได้แต่ไม่เห็นข้อมูลติดต่อเต็มของผู้สมัครจริง
  return ok(c, rows.map((u) => ({ id: u.id, name: u.name, email: u.email ? maskEmail(u.email) : "", phone: u.phone ? maskPhone(u.phone) : "", role: u.role, createdAt: new Date(u.created_at).getTime() })));
});

// ── platform dashboard ───────────────────────────────────────────
r.get("/dashboard", async (c) => {
  const users = (await get<{ c: number }>("select count(*)::int as c from users"))!.c;
  const events = (await get<{ c: number }>("select count(*)::int as c from events"))!.c;
  const o = (await get<{ orders: number; gmv: number }>("select count(*)::int as orders, coalesce(sum(subtotal),0)::int as gmv from orders where status = 'COMPLETED'"))!;
  const tk = (await get<{ tickets: number; checked: number }>("select count(*)::int as tickets, coalesce(sum(case when status='CHECKED_IN' then 1 else 0 end),0)::int as checked from tickets"))!;
  const pendingOrgs = (await get<{ c: number }>("select count(*)::int as c from organizer_apps where status = 'DISCUSSING'"))!.c;
  return ok(c, { users, events, orders: o.orders, gmv: o.gmv, tickets: tk.tickets, checkedIn: tk.checked, pendingOrganizers: pendingOrgs });
});

export default r;
