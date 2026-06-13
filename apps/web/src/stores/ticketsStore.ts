// ticketsStore — บัตรที่ลูกค้าซื้อแล้ว (persist) สำหรับหน้า My Tickets
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MyTicketStatus = "ISSUED" | "CHECKED_IN";

export interface MyTicket {
  id: string;
  ticketNo: string;
  orderNo: string;
  eventTitle: string;
  eventImage?: string;
  ticketName: string;
  sessionLabel?: string;
  qr: string;
  status: MyTicketStatus;
  purchasedAt: number;
}

export type CheckInResult =
  | { ok: true; ticket: MyTicket }
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_USED"; ticket?: MyTicket };

interface TicketsState {
  tickets: MyTicket[];
  addTickets: (list: MyTicket[]) => void;
  // เช็คอินแบบ single-use (atomic): สำเร็จครั้งเดียว ครั้งต่อไป = ALREADY_USED
  checkIn: (ticketNo: string) => CheckInResult;
  clearAll: () => void;
}

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: [],
      addTickets: (list) => set((s) => ({ tickets: [...list, ...s.tickets] })),
      checkIn: (ticketNo) => {
        const t = get().tickets.find((x) => x.ticketNo === ticketNo.trim());
        if (!t) return { ok: false, reason: "NOT_FOUND" };
        if (t.status === "CHECKED_IN") return { ok: false, reason: "ALREADY_USED", ticket: t };
        set((s) => ({ tickets: s.tickets.map((x) => (x.ticketNo === t.ticketNo ? { ...x, status: "CHECKED_IN" } : x)) }));
        return { ok: true, ticket: { ...t, status: "CHECKED_IN" } };
      },
      clearAll: () => set({ tickets: [] }),
    }),
    { name: "ecn-my-tickets" }
  )
);
