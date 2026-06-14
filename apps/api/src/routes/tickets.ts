// My Tickets: บัตรทั้งหมดของผู้ใช้ที่ล็อกอิน
import { Hono } from "hono";
import { all } from "../db.ts";
import { ok } from "../lib/response.ts";
import { requireAuth, type JwtUser } from "../lib/auth.ts";

const r = new Hono<{ Variables: { user: JwtUser } }>();
r.use("*", requireAuth);

r.get("/", async (c) => {
  const user = c.get("user");
  const rows = await all<{
    ticket_no: string; order_no: string; event_title: string; event_image: string | null;
    ticket_name: string; session_label: string | null; qr: string; status: string; issued_at: string | Date;
  }>(
    `select t.ticket_no, o.order_no, t.event_title, t.event_image, t.ticket_name, t.session_label, t.qr, t.status, t.issued_at
     from tickets t join orders o on o.id = t.order_id
     where t.user_id = ? order by t.issued_at desc`, user.id);

  return ok(c, rows.map((t) => ({
    id: t.ticket_no, ticketNo: t.ticket_no, orderNo: t.order_no,
    eventTitle: t.event_title, eventImage: t.event_image ?? undefined,
    ticketName: t.ticket_name, sessionLabel: t.session_label ?? undefined,
    qr: t.qr, status: t.status, purchasedAt: new Date(t.issued_at).getTime() || Date.now(),
  })));
});

export default r;
