// Events: list (การ์ด) + detail (เต็ม) — map snake_case → camelCase ให้ตรง type ฝั่ง frontend
import { Hono } from "hono";
import { all, get } from "../db.ts";
import { ok, ApiError } from "../lib/response.ts";
import type { Env } from "../env.ts";

const r = new Hono<{ Bindings: Env }>();

type EventRow = Record<string, unknown>;
const toCard = (e: EventRow) => ({
  id: e.id, slug: e.slug, title: e.title, province: e.province, venue: e.venue,
  category: e.category, dateLabel: e.date_label, timeLabel: e.time_label,
  priceFrom: e.price_from, rating: Number(e.rating), reviews: e.reviews,
  badge: e.badge ?? undefined, accent: e.accent, image: e.image ?? undefined, status: e.status,
});

// GET /events?category=
r.get("/", async (c) => {
  const category = c.req.query("category");
  const rows = !category || category === "all"
    ? await all<EventRow>("select * from events order by created_at desc")
    : await all<EventRow>("select * from events where category = ? order by created_at desc", category);
  return ok(c, rows.map(toCard));
});

// GET /events/:slug — รายละเอียดเต็ม
r.get("/:slug", async (c) => {
  const e = await get<EventRow>("select * from events where slug = ? limit 1", c.req.param("slug"));
  if (!e) throw new ApiError(404, "NOT_FOUND", "ไม่พบอีเวนต์ที่คุณค้นหา");
  const id = e.id as string;

  const highlights = await all<{ icon: string; title: string; desc: string }>(`select icon, title, "desc" from event_highlights where event_id = ? order by sort`, id);
  const sessions = await all<{ code: string; label: string; date_label: string }>("select code, label, date_label from event_sessions where event_id = ? order by sort", id);
  const ticketTypes = await all<{ code: string; kind: string; name: string; price: number; perks: string; badge: string | null }>("select code, kind, name, price, perks, badge from ticket_types where event_id = ? order by sort", id);
  const faq = await all<{ q: string; a: string }>("select q, a from event_faq where event_id = ? order by sort", id);
  const terms = await all<{ text: string }>("select text from event_terms where event_id = ? order by sort", id);
  const gallery = await all<{ url: string }>("select url from event_gallery where event_id = ? order by sort", id);

  return ok(c, {
    ...toCard(e),
    subtitle: e.subtitle ?? undefined,
    presenter: e.presenter ?? undefined,
    locationLabel: e.location_label ?? undefined,
    description: e.description ?? "",
    highlights: highlights.map((h) => ({ icon: h.icon, title: h.title, desc: h.desc })),
    sessions: sessions.map((s) => ({ id: s.code, label: s.label, dateLabel: s.date_label })),
    ticketTypes: ticketTypes.map((t) => ({ id: t.code, kind: t.kind, name: t.name, price: t.price, perks: JSON.parse(t.perks) as string[], badge: t.badge ?? undefined })),
    faq, terms: terms.map((t) => t.text), gallery: gallery.map((g) => g.url),
  });
});

export default r;
