// Affiliate: track click (public), apply, dashboard (stats จากการซื้อจริง), links, commissions, referred users
import { Hono } from "hono";
import { all, get, run } from "../db.ts";
import { ok, ApiError } from "../lib/response.ts";
import { requireAuth, signToken, type JwtUser } from "../lib/auth.ts";
import { affiliateApplySchema, trackSchema } from "../schemas.ts";

const r = new Hono<{ Variables: { user: JwtUser } }>();

// public — บันทึกคลิกลิงก์แนะนำ (?ref=CODE)
r.post("/track", async (c) => {
  const { code } = trackSchema.parse(await c.req.json());
  if (await get("select 1 as x from affiliates where code = ?", code)) await run("insert into referral_clicks (code) values (?)", code);
  return ok(c, { tracked: true });
});

r.use("*", requireAuth); // ด้านล่างต้องล็อกอิน

type Aff = { code: string; name: string; channel: string | null; rate_bps: number };

// POST /affiliate/apply — สมัครเป็นตัวแทนแนะนำ → role AFFILIATE + ออก token ใหม่
r.post("/apply", async (c) => {
  const body = affiliateApplySchema.parse(await c.req.json());
  const user = c.get("user");
  let aff = await get<Aff>("select code, name, channel, rate_bps from affiliates where user_id = ? limit 1", user.id);
  if (!aff) {
    let code = "";
    for (let i = 0; i < 8; i++) { code = "AFF" + String(Math.floor(100 + Math.random() * 900)); if (!(await get("select 1 as x from affiliates where code = ?", code))) break; }
    await run("insert into affiliates (code, user_id, name, channel, rate_bps) values (?,?,?,?, 1000)", code, user.id, body.name, body.channel);
    await run("update users set role = 'AFFILIATE' where id = ?", user.id);
    aff = { code, name: body.name, channel: body.channel, rate_bps: 1000 };
  }
  const newUser: JwtUser = { ...user, role: "AFFILIATE" };
  return ok(c, { code: aff.code, profile: { name: body.name, email: body.email, phone: body.phone, channel: body.channel }, token: await signToken(newUser), user: newUser }, 201);
});

const myAff = async (userId: string): Promise<Aff> => {
  const aff = await get<Aff>("select code, name, channel, rate_bps from affiliates where user_id = ? limit 1", userId);
  if (!aff) throw new ApiError(404, "NOT_FOUND", "ยังไม่ได้สมัครเป็นตัวแทนแนะนำ");
  return aff;
};

// GET /affiliate/me — โปรไฟล์ + สถิติจากการซื้อจริง
r.get("/me", async (c) => {
  const aff = await myAff(c.get("user").id);
  const clicks = (await get<{ c: number }>("select count(*)::int as c from referral_clicks where code = ?", aff.code))?.c ?? 0;
  const o = (await get<{ cnt: number; rev: number }>("select count(*)::int as cnt, coalesce(sum(subtotal),0)::int as rev from orders where affiliate_code = ? and status = 'COMPLETED'", aff.code))!;
  const cm = (await get<{ total: number; pending: number }>("select coalesce(sum(amount),0)::int as total, coalesce(sum(case when status='PENDING' then amount else 0 end),0)::int as pending from commissions where affiliate_code = ?", aff.code))!;
  return ok(c, {
    profile: { code: aff.code, name: aff.name, channel: aff.channel ?? undefined, rateBps: aff.rate_bps },
    stats: { clicks, orders: o.cnt, revenue: o.rev, totalEarned: cm.total, pending: cm.pending, conversion: clicks ? +((o.cnt / clicks) * 100).toFixed(1) : 0 },
  });
});

// GET /affiliate/links — ลิงก์แนะนำต่ออีเวนต์ (พร้อมสถิติของ affiliate)
r.get("/links", async (c) => {
  const aff = await myAff(c.get("user").id);
  const events = await all<{ slug: string; title: string }>("select slug, title from events order by created_at desc");
  const o = (await get<{ cnt: number; rev: number }>("select count(*)::int as cnt, coalesce(sum(subtotal),0)::int as rev from orders where affiliate_code = ? and status='COMPLETED'", aff.code))!;
  const clicks = (await get<{ c: number }>("select count(*)::int as c from referral_clicks where code = ?", aff.code))?.c ?? 0;
  return ok(c, events.map((e) => ({ id: e.slug, code: aff.code, eventTitle: e.title, slug: e.slug, clicks, orders: o.cnt, revenue: o.rev })));
});

// GET /affiliate/commissions — รายการคอมมิชชั่น
r.get("/commissions", async (c) => {
  const aff = await myAff(c.get("user").id);
  const rows = await all<{ id: string; order_no: string; event_title: string | null; base: number; amount: number; status: string; created_at: string | Date }>(
    "select id, order_no, event_title, base, amount, status, created_at from commissions where affiliate_code = ? order by created_at desc", aff.code);
  return ok(c, rows.map((x) => ({ id: x.id, orderNo: x.order_no, eventTitle: x.event_title ?? "", base: x.base, amount: x.amount, status: x.status, date: new Date(x.created_at).toISOString() })));
});

// GET /affiliate/referred-users — ผู้ใช้ที่ซื้อผ่านลิงก์ (อีเมลปกปิด)
r.get("/referred-users", async (c) => {
  const aff = await myAff(c.get("user").id);
  const rows = await all<{ buyer_name: string; buyer_email: string; cnt: number; spent: number; joined: string | Date }>(
    `select buyer_name, buyer_email, count(*)::int as cnt, coalesce(sum(subtotal),0)::int as spent, min(created_at) as joined
     from orders where affiliate_code = ? and status='COMPLETED' group by buyer_email, buyer_name order by joined desc`, aff.code);
  const rate = aff.rate_bps;
  const mask = (e: string) => e.replace(/^(.{1,3}).*(@.*)$/, "$1•••$2");
  return ok(c, rows.map((u, i) => ({ id: `ru-${i}`, name: u.buyer_name, email: mask(u.buyer_email ?? ""), joined: new Date(u.joined).toISOString(), orders: u.cnt, spent: u.spent, commission: Math.floor((u.spent * rate) / 10000) })));
});

export default r;
