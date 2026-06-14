// API client (mock-first) — interface เดียว สลับ mock ↔ Axios ด้วย VITE_USE_MOCK
// USE_MOCK=true (default, ตัว demo GitHub Pages) → คืน mock · false (local dev) → เรียก backend จริง
import { http, USE_MOCK } from "./http";
import { EVENTS, FEATURED_EVENT, type EcnEvent } from "../data/events";
import type { AuthUser } from "../stores/authStore";
import type { MyTicket } from "../stores/ticketsStore";

const delay = <T>(data: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(data), ms));

// helper: แกะ { success, data } ของ backend
const unwrap = <T>(r: { data: { data: T } }): T => r.data.data;

// ── payload/response types (ตรง backend apps/api) ────────────────
export interface OrderItemInput { ticketTypeId: string; quantity: number; sessionId?: string }
export interface CreateOrderInput {
  eventSlug: string;
  items: OrderItemInput[];
  buyer: { name: string; phone: string; email: string };
  affiliateCode?: string | null;
}
export interface CreatedOrder { orderNo: string; subtotal: number; status: string; expiresAt: string; channel: string }
export interface IssuedTicketDto { ticketNo: string; eventTitle: string; eventImage?: string; ticketName: string; sessionLabel?: string; qr: string }
export interface PaidOrder { order: { orderNo: string; status: string; subtotal: number }; tickets: IssuedTicketDto[] }
export type CheckinResult =
  | { ok: true; ticketNo: string; eventTitle: string; ticketName: string }
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_USED"; ticketNo: string; eventTitle?: string; ticketName?: string };
export interface AuthResult { token: string; user: AuthUser }

export const api = {
  async getEvents(category?: string): Promise<EcnEvent[]> {
    if (USE_MOCK) {
      return delay(!category || category === "all" ? EVENTS : EVENTS.filter((e) => e.category === category));
    }
    return unwrap<EcnEvent[]>(await http.get("/events", { params: { category } }));
  },

  async getFeatured() {
    if (USE_MOCK) return delay(FEATURED_EVENT);
    return unwrap(await http.get(`/events/${FEATURED_EVENT.slug}`));
  },

  async getEvent(slug: string): Promise<EcnEvent | undefined> {
    if (USE_MOCK) return delay(EVENTS.find((e) => e.slug === slug));
    return unwrap(await http.get(`/events/${slug}`));
  },

  // ── auth (real-only — เรียกเฉพาะตอน !USE_MOCK) ────────────────
  auth: {
    async requestOtp(phone: string) { return unwrap(await http.post("/auth/request-otp", { phone })); },
    async verifyOtp(phone: string, code: string): Promise<AuthResult> { return unwrap<AuthResult>(await http.post("/auth/verify-otp", { phone, code })); },
    async register(b: { name: string; phone: string; email: string }): Promise<AuthResult> { return unwrap<AuthResult>(await http.post("/auth/register", b)); },
    async social(b: { provider: string; name?: string; email?: string }): Promise<AuthResult> { return unwrap<AuthResult>(await http.post("/auth/social", b)); },
  },

  // ── orders/checkout ──────────────────────────────────────────
  orders: {
    async create(b: CreateOrderInput): Promise<CreatedOrder> { return unwrap<CreatedOrder>(await http.post("/orders", b)); },
    async pay(orderNo: string): Promise<PaidOrder> { return unwrap<PaidOrder>(await http.post(`/orders/${orderNo}/pay`, {})); },
  },

  // ── tickets / check-in ───────────────────────────────────────
  tickets: {
    async list(): Promise<MyTicket[]> { return unwrap<MyTicket[]>(await http.get("/tickets")); },
  },
  checkin: {
    async scan(ticketNo: string): Promise<CheckinResult> { return unwrap<CheckinResult>(await http.post("/checkin", { ticketNo })); },
  },

  // ── affiliate ────────────────────────────────────────────────
  affiliate: {
    async track(code: string) { return unwrap(await http.post("/affiliate/track", { code })); },
    async apply(b: { name: string; channel?: string; email?: string; phone?: string }) { return unwrap(await http.post("/affiliate/apply", b)); },
    async me() { return unwrap(await http.get("/affiliate/me")); },
    async links() { return unwrap(await http.get("/affiliate/links")); },
    async commissions() { return unwrap(await http.get("/affiliate/commissions")); },
    async referredUsers() { return unwrap(await http.get("/affiliate/referred-users")); },
  },
};
