// Orders/checkout: สร้าง order (hold 15 นาที) → จ่าย (ออกตั๋ว+QR + บันทึก commission affiliate)
import { Hono } from "hono";
import { db, all, get, run } from "../db.ts";
import { ok, ApiError } from "../lib/response.ts";
import { requireAuth, type JwtUser } from "../lib/auth.ts";
import { makeQr } from "../lib/qr.ts";
import { createOrderSchema } from "../schemas.ts";

const r = new Hono<{ Variables: { user: JwtUser } }>();
r.use("*", requireAuth);

const genOrderNo = (): string => {
  for (let i = 0; i < 5; i++) {
    const no = `EVX-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    if (!get("select 1 as x from orders where order_no = ?", no)) return no;
  }
  return `EVX-2026-${Date.now().toString().slice(-6)}`;
};

type TT = { id: string; name: string; price: number };

// POST /orders — สร้าง order สถานะ PENDING + hold 15 นาที (ราคาคำนวณฝั่ง server)
r.post("/", async (c) => {
  const body = createOrderSchema.parse(await c.req.json());
  const user = c.get("user");

  const ev = get<{ id: string; title: string }>("select id, title from events where slug = ? limit 1", body.eventSlug);
  if (!ev) throw new ApiError(404, "NOT_FOUND", "ไม่พบอีเวนต์");

  const sessionLabel = body.items[0]?.sessionId
    ? get<{ date_label: string }>("select date_label from event_sessions where event_id = ? and code = ?", ev.id, body.items[0].sessionId)?.date_label ?? null
    : null;

  // ตรวจ ticket type + คำนวณยอดจากราคาจริงใน DB (กันลูกค้าส่งราคาปลอม)
  const lines = body.items.map((it) => {
    const tt = get<TT>("select id, name, price from ticket_types where event_id = ? and code = ?", ev.id, it.ticketTypeId);
    if (!tt) throw new ApiError(400, "VALIDATION_ERROR", `ไม่พบประเภทบัตร ${it.ticketTypeId}`);
    return { tt, quantity: it.quantity };
  });
  const subtotal = lines.reduce((s, l) => s + l.tt.price * l.quantity, 0);

  const affiliateCode = body.affiliateCode?.trim() || null;
  const channel = affiliateCode && get("select 1 as x from affiliates where code = ?", affiliateCode) ? "AFFILIATE" : "DIRECT";
  const orderNo = genOrderNo();
  const orderId = crypto.randomUUID();

  db.transaction(() => {
    run(`insert into orders (id, order_no, user_id, status, subtotal, affiliate_code, buyer_name, buyer_email, buyer_phone, channel, expires_at)
         values (?,?,?, 'PENDING', ?,?,?,?,?,?, datetime('now','+15 minutes'))`,
      orderId, orderNo, user.id, subtotal, affiliateCode, body.buyer.name, body.buyer.email, body.buyer.phone, channel);
    for (const l of lines)
      run(`insert into order_items (order_id, ticket_type_id, event_id, event_title, ticket_name, session_label, unit_price, quantity)
           values (?,?,?,?,?,?,?,?)`, orderId, l.tt.id, ev.id, ev.title, l.tt.name, sessionLabel, l.tt.price, l.quantity);
  })();

  const exp = get<{ expires_at: string }>("select expires_at from orders where id = ?", orderId);
  return ok(c, { orderNo, subtotal, status: "PENDING", expiresAt: exp?.expires_at, channel }, 201);
});

// POST /orders/:orderNo/pay — ยืนยันชำระเงิน → ออกตั๋ว + QR + commission
r.post("/:orderNo/pay", async (c) => {
  const user = c.get("user");
  const orderNo = c.req.param("orderNo");
  const order = get<{ id: string; user_id: string; status: string; subtotal: number; affiliate_code: string | null; expired: number }>(
    `select id, user_id, status, subtotal, affiliate_code, (datetime('now') > expires_at) as expired from orders where order_no = ? limit 1`, orderNo);
  if (!order) throw new ApiError(404, "NOT_FOUND", "ไม่พบคำสั่งซื้อ");
  if (order.user_id !== user.id) throw new ApiError(403, "FORBIDDEN", "ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้");
  if (order.status === "COMPLETED") throw new ApiError(409, "CONFLICT", "คำสั่งซื้อนี้ชำระแล้ว");
  if (order.status !== "PENDING") throw new ApiError(409, "CONFLICT", "สถานะคำสั่งซื้อไม่ถูกต้อง");
  if (order.expired) throw new ApiError(410, "EXPIRED", "หมดเวลาชำระเงิน ที่นั่งถูกปล่อยคืนแล้ว");

  const items = all<{ event_id: string; event_title: string; ticket_name: string; session_label: string | null; quantity: number }>(
    "select event_id, event_title, ticket_name, session_label, quantity from order_items where order_id = ?", order.id);

  // เตรียม QR (async) ก่อนเข้า transaction
  const toIssue: { ticketNo: string; eventId: string; eventTitle: string; eventImage: string | null; ticketName: string; sessionLabel: string | null; qr: string }[] = [];
  let n = 1;
  for (const it of items) {
    const img = get<{ image: string | null }>("select image from events where id = ?", it.event_id)?.image ?? null;
    for (let i = 0; i < it.quantity; i++) {
      const ticketNo = `${orderNo}-${String(n).padStart(2, "0")}`;
      const qr = await makeQr(JSON.stringify({ orderNo, ticketNo, event: it.event_title, type: it.ticket_name }));
      toIssue.push({ ticketNo, eventId: it.event_id, eventTitle: it.event_title, eventImage: img, ticketName: it.ticket_name, sessionLabel: it.session_label, qr });
      n++;
    }
  }

  db.transaction(() => {
    run("update orders set status = 'COMPLETED', paid_at = datetime('now') where id = ?", order.id);
    for (const t of toIssue)
      run(`insert into tickets (ticket_no, order_id, user_id, event_id, event_title, event_image, ticket_name, session_label, qr, status)
           values (?,?,?,?,?,?,?,?,?, 'ISSUED')`,
        t.ticketNo, order.id, user.id, t.eventId, t.eventTitle, t.eventImage, t.ticketName, t.sessionLabel, t.qr);
    // commission ให้ affiliate (ถ้ามี code ที่ลงทะเบียน)
    if (order.affiliate_code) {
      const aff = get<{ rate_bps: number }>("select rate_bps from affiliates where code = ?", order.affiliate_code);
      if (aff) {
        const amount = Math.floor((order.subtotal * aff.rate_bps) / 10000);
        run(`insert into commissions (affiliate_code, order_id, order_no, event_title, base, amount, status)
             values (?,?,?,?,?,?, 'PENDING')`, order.affiliate_code, order.id, orderNo, items[0]?.event_title ?? null, order.subtotal, amount);
      }
    }
  })();

  return ok(c, {
    order: { orderNo, status: "COMPLETED", subtotal: order.subtotal },
    tickets: toIssue.map((t) => ({ ticketNo: t.ticketNo, eventTitle: t.eventTitle, eventImage: t.eventImage ?? undefined, ticketName: t.ticketName, sessionLabel: t.sessionLabel ?? undefined, qr: t.qr })),
  });
});

// GET /orders/:orderNo — สถานะคำสั่งซื้อ
r.get("/:orderNo", (c) => {
  const user = c.get("user");
  const order = get<{ id: string; user_id: string; order_no: string; status: string; subtotal: number; affiliate_code: string | null }>(
    "select id, user_id, order_no, status, subtotal, affiliate_code from orders where order_no = ? limit 1", c.req.param("orderNo"));
  if (!order) throw new ApiError(404, "NOT_FOUND", "ไม่พบคำสั่งซื้อ");
  if (order.user_id !== user.id) throw new ApiError(403, "FORBIDDEN", "ไม่มีสิทธิ์");
  const items = all("select event_title, ticket_name, session_label, unit_price, quantity from order_items where order_id = ?", order.id);
  return ok(c, { orderNo: order.order_no, status: order.status, subtotal: order.subtotal, affiliateCode: order.affiliate_code ?? undefined, items });
});

export default r;
