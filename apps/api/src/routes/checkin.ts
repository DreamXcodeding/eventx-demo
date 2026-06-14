// Check-in: สแกนเลขบัตร → ใช้ครั้งเดียว (single-use) · ต้องล็อกอิน (staff)
import { Hono } from "hono";
import { get, run } from "../db.ts";
import { ok } from "../lib/response.ts";
import { requireAuth, type JwtUser } from "../lib/auth.ts";
import { checkinSchema } from "../schemas.ts";

const r = new Hono<{ Variables: { user: JwtUser } }>();
r.use("*", requireAuth);

r.post("/", async (c) => {
  const { ticketNo } = checkinSchema.parse(await c.req.json());
  const t = await get<{ id: string; status: string; event_title: string; ticket_name: string }>(
    "select id, status, event_title, ticket_name from tickets where ticket_no = ? limit 1", ticketNo);

  if (!t) return ok(c, { ok: false, reason: "NOT_FOUND", ticketNo });
  if (t.status === "CHECKED_IN")
    return ok(c, { ok: false, reason: "ALREADY_USED", ticketNo, eventTitle: t.event_title, ticketName: t.ticket_name });

  await run("update tickets set status = 'CHECKED_IN', checked_in_at = now() where id = ?", t.id);
  return ok(c, { ok: true, ticketNo, eventTitle: t.event_title, ticketName: t.ticket_name });
});

export default r;
