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
    // DEMO: รับ role agent/organizer/admin เพื่อเข้า portal
    async assumeRole(role: "AGENT" | "ORGANIZER" | "ADMIN"): Promise<AuthResult> { return unwrap<AuthResult>(await http.post("/auth/dev-assume-role", { role })); },
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
    async apply(b: { name: string; channel?: string; email?: string; phone?: string }) { return unwrap<AffiliateApplyResult>(await http.post("/affiliate/apply", b)); },
    async me() { return unwrap<AffiliateMe>(await http.get("/affiliate/me")); },
    async links() { return unwrap<AffiliateLink[]>(await http.get("/affiliate/links")); },
    async commissions() { return unwrap<AffiliateCommission[]>(await http.get("/affiliate/commissions")); },
    async referredUsers() { return unwrap<ReferredUser[]>(await http.get("/affiliate/referred-users")); },
  },

  // ── agent (role AGENT/ADMIN) ─────────────────────────────────
  agent: {
    async createBooking(b: AgentBookingInput): Promise<AgentBookingDto> { return unwrap<AgentBookingDto>(await http.post("/agent/bookings", b)); },
    async bookings(): Promise<AgentBookingDto[]> { return unwrap<AgentBookingDto[]>(await http.get("/agent/bookings")); },
    async summary(): Promise<AgentSummary> { return unwrap<AgentSummary>(await http.get("/agent/summary")); },
  },

  // ── organizer (role ORGANIZER/ADMIN) ─────────────────────────
  organizer: {
    async events(): Promise<OrgEventDto[]> { return unwrap<OrgEventDto[]>(await http.get("/organizer/events")); },
    async dashboard(): Promise<OrgDashboard> { return unwrap<OrgDashboard>(await http.get("/organizer/dashboard")); },
  },

  // ── admin (role ADMIN) ───────────────────────────────────────
  admin: {
    async organizers(): Promise<OrganizerAppDto[]> { return unwrap<OrganizerAppDto[]>(await http.get("/admin/organizers")); },
    async approveOrganizer(id: string, feeBps: number): Promise<OrganizerAppDto> { return unwrap<OrganizerAppDto>(await http.post(`/admin/organizers/${id}/approve`, { feeBps })); },
    async rejectOrganizer(id: string): Promise<OrganizerAppDto> { return unwrap<OrganizerAppDto>(await http.post(`/admin/organizers/${id}/reject`, {})); },
    async events(): Promise<AdminEventDto[]> { return unwrap<AdminEventDto[]>(await http.get("/admin/events")); },
    async createEvent(b: AdminEventInput): Promise<AdminEventDto> { return unwrap<AdminEventDto>(await http.post("/admin/events", b)); },
    async publishEvent(id: string): Promise<AdminEventDto> { return unwrap<AdminEventDto>(await http.post(`/admin/events/${id}/publish`, {})); },
    async users(): Promise<AdminUserDto[]> { return unwrap<AdminUserDto[]>(await http.get("/admin/users")); },
    async dashboard(): Promise<AdminDashboard> { return unwrap<AdminDashboard>(await http.get("/admin/dashboard")); },
  },
};

// ── Phase 3 DTOs (ตรง backend) ───────────────────────────────────
export interface AffiliateApplyResult { code: string; profile: { name: string; email?: string; phone?: string; channel?: string }; token: string; user: AuthUser }
export interface AffiliateMe { profile: { code: string; name: string; channel?: string; rateBps: number }; stats: { clicks: number; orders: number; revenue: number; totalEarned: number; pending: number; conversion: number } }
export interface AffiliateLink { id: string; code: string; eventTitle: string; slug: string; clicks: number; orders: number; revenue: number }
export interface AffiliateCommission { id: string; orderNo: string; eventTitle: string; base: number; amount: number; status: string; date: string }
export interface ReferredUser { id: string; name: string; email: string; joined: string; orders: number; spent: number; commission: number }

export interface AgentBookingInput { eventSlug: string; ticketTypeId: string; sessionId?: string; qty: number; customer: { name: string; email: string } }
export interface AgentBookingDto { id: string; bookingNo: string; eventTitle: string; ticketName: string; sessionLabel?: string; qty: number; amount: number; customerName: string; customerEmail: string; createdAt: number }
export interface AgentSummary { bookings: number; totalQty: number; totalAmount: number }

export interface OrgEventDto { id: string; slug: string; title: string; dateLabel: string; price: number; quota: number; sold: number; checkedIn: number; status: "ON_SALE" | "ENDED"; revenue: number }
export interface OrgDashboard { events: number; totalSold: number; totalCheckedIn: number; revenue: number; feeBps: number; fee: number; net: number }

export interface OrganizerAppDto { id: string; company: string; contact: string; phone: string; requestedTickets: number; feeBps: number | null; status: string; appliedAt: number }
export interface AdminEventInput { title: string; province?: string; category?: string; dateLabel?: string; priceFrom: number }
export interface AdminEventDto { id: string; title: string; province: string; category: string; dateLabel: string; priceFrom: number; source: string; status: string; createdAt: number }
export interface AdminUserDto { id: string; name: string; email: string; phone: string; role: string; createdAt: number }
export interface AdminDashboard { users: number; events: number; orders: number; gmv: number; tickets: number; checkedIn: number; pendingOrganizers: number }
