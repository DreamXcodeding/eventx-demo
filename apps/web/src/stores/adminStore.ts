// adminStore — ใบสมัคร organizer (PARTNER) + อีเวนต์ที่แอดมินลงเอง (INTERNAL) · mock persist
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrgStatus = "DISCUSSING" | "APPROVED" | "REJECTED";

export interface OrganizerApp {
  id: string;
  company: string;
  contact: string;
  phone: string;
  requestedTickets: number; // จำนวนตั๋วที่คาดว่าจะขาย
  feeBps: number | null; // ค่าดำเนินการที่ตกลง (bps) — null = ยังไม่ตั้ง
  status: OrgStatus;
  appliedAt: number;
}

export interface AdminEvent {
  id: string;
  title: string;
  province: string;
  category: string;
  dateLabel: string;
  priceFrom: number;
  source: "INTERNAL";
  status: "DRAFT" | "PUBLISHED";
  createdAt: number;
}

interface AdminState {
  organizers: OrganizerApp[];
  events: AdminEvent[];
  approveOrganizer: (id: string, feeBps: number) => void;
  rejectOrganizer: (id: string) => void;
  addEvent: (e: AdminEvent) => void;
  publishEvent: (id: string) => void;
}

const SEED_ORGS: OrganizerApp[] = [
  { id: "org-1", company: "Lanna Live Co.", contact: "ปรีชา ศรีสุข", phone: "0891234567", requestedTickets: 2000, feeBps: null, status: "DISCUSSING", appliedAt: 1 },
  { id: "org-2", company: "BKK Concerts", contact: "วันดี ทองคำ", phone: "0822345678", requestedTickets: 8000, feeBps: null, status: "DISCUSSING", appliedAt: 2 },
  { id: "org-3", company: "Phuket Events", contact: "John Carter", phone: "0833456789", requestedTickets: 1200, feeBps: 700, status: "APPROVED", appliedAt: 3 },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      organizers: SEED_ORGS,
      events: [],
      approveOrganizer: (id, feeBps) =>
        set((s) => ({ organizers: s.organizers.map((o) => (o.id === id ? { ...o, feeBps, status: "APPROVED" } : o)) })),
      rejectOrganizer: (id) =>
        set((s) => ({ organizers: s.organizers.map((o) => (o.id === id ? { ...o, status: "REJECTED" } : o)) })),
      addEvent: (e) => set((s) => ({ events: [e, ...s.events] })),
      publishEvent: (id) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, status: "PUBLISHED" } : e)) })),
    }),
    { name: "ecn-admin" }
  )
);
