// Agent: ออก booking ให้ลูกค้า (บันทึกอย่างเดียว ไม่มี payment/commission) · role AGENT/ADMIN
import { Hono } from "hono";
import { all, get, run } from "../db.ts";
import { ok, ApiError } from "../lib/response.ts";
import { requireAuth, requireRole, type JwtUser } from "../lib/auth.ts";
import { agentBookingSchema } from "../schemas.ts";
import type { Env } from "../env.ts";

const r = new Hono<{ Variables: { user: JwtUser }; Bindings: Env }>();
r.use("*", requireAuth);
r.use("*", requireRole("AGENT", "ADMIN"));

const genBookingNo = async (): Promise<string> => {
  for (let i = 0; i < 5; i++) {
    const no = `AGT-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    if (!(await get("select 1 as x from agent_bookings where booking_no = ?", no))) return no;
  }
  return `AGT-2026-${Date.now().toString().slice(-6)}`;
};

type BookingRow = {
  booking_no: string; event_title: string; ticket_name: string; session_label: string | null;
  qty: number; amount: number; customer_name: string; customer_email: string | null; created_at: string | Date;
};
const toBooking = (b: BookingRow) => ({
  id: b.booking_no, bookingNo: b.booking_no, eventTitle: b.event_title, ticketName: b.ticket_name,
  sessionLabel: b.session_label ?? undefined, qty: b.qty, amount: b.amount,
  customerName: b.customer_name, customerEmail: b.customer_email ?? "", createdAt: new Date(b.created_at).getTime(),
});

// POST /agent/bookings — สร้าง booking (ราคาคิดฝั่ง server)
r.post("/bookings", async (c) => {
  const body = agentBookingSchema.parse(await c.req.json());
  const agent = c.get("user");

  const event = await get<{ id: string; title: string }>("select id, title from events where slug = ? limit 1", body.eventSlug);
  if (!event) throw new ApiError(404, "NOT_FOUND", "ไม่พบอีเวนต์");
  const tt = await get<{ name: string; price: number }>("select name, price from ticket_types where event_id = ? and code = ?", event.id, body.ticketTypeId);
  if (!tt) throw new ApiError(400, "VALIDATION_ERROR", "ไม่พบประเภทบัตร");
  const sessionLabel = body.sessionId
    ? (await get<{ date_label: string }>("select date_label from event_sessions where event_id = ? and code = ?", event.id, body.sessionId))?.date_label ?? null
    : null;

  const bookingNo = await genBookingNo();
  const amount = tt.price * body.qty;
  await run(
    `insert into agent_bookings (booking_no, agent_id, event_id, event_title, ticket_name, session_label, qty, amount, customer_name, customer_email)
     values (?,?,?,?,?,?,?,?,?,?)`,
    bookingNo, agent.id, event.id, event.title, tt.name, sessionLabel, body.qty, amount, body.customer.name, body.customer.email
  );
  const created = await get<BookingRow>("select booking_no, event_title, ticket_name, session_label, qty, amount, customer_name, customer_email, created_at from agent_bookings where booking_no = ?", bookingNo);
  return ok(c, toBooking(created!), 201);
});

// GET /agent/bookings — booking ทั้งหมดของ agent นี้
r.get("/bookings", async (c) => {
  const rows = await all<BookingRow>(
    "select booking_no, event_title, ticket_name, session_label, qty, amount, customer_name, customer_email, created_at from agent_bookings where agent_id = ? order by created_at desc",
    c.get("user").id
  );
  return ok(c, rows.map(toBooking));
});

// GET /agent/summary — สรุปยอดของ agent
r.get("/summary", async (c) => {
  const s = (await get<{ bookings: number; qty: number; amount: number }>(
    "select count(*)::int as bookings, coalesce(sum(qty),0)::int as qty, coalesce(sum(amount),0)::int as amount from agent_bookings where agent_id = ?",
    c.get("user").id
  ))!;
  return ok(c, { bookings: s.bookings, totalQty: s.qty, totalAmount: s.amount });
});

export default r;
