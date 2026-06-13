// API client (mock-first) — interface เดียว สลับ mock ↔ Axios ด้วย VITE_USE_MOCK
// ตอนนี้ USE_MOCK=true → คืน mock · ภายหลังตั้ง false → เรียก backend จริงผ่าน http (ดู API_SPEC.md)
import { http, USE_MOCK } from "./http";
import { EVENTS, FEATURED_EVENT, type EcnEvent } from "../data/events";

const delay = <T>(data: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(data), ms));

export const api = {
  async getEvents(category?: string): Promise<EcnEvent[]> {
    if (USE_MOCK) {
      return delay(!category || category === "all" ? EVENTS : EVENTS.filter((e) => e.category === category));
    }
    const { data } = await http.get("/events", { params: { category } });
    return data.data;
  },

  async getFeatured() {
    if (USE_MOCK) return delay(FEATURED_EVENT);
    const { data } = await http.get(`/events/${FEATURED_EVENT.slug}`);
    return data;
  },

  async getEvent(slug: string): Promise<EcnEvent | undefined> {
    if (USE_MOCK) return delay(EVENTS.find((e) => e.slug === slug));
    const { data } = await http.get(`/events/${slug}`);
    return data;
  },
};
