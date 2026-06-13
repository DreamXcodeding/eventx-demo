// agentStore — booking ที่ agent ออกให้ลูกค้า (persist) · ไม่มี payment/commission ในระบบ (ECN-Technical-Design A1)
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AgentBooking {
  id: string;
  bookingNo: string;
  eventTitle: string;
  ticketName: string;
  sessionLabel?: string;
  qty: number;
  amount: number; // ยอดบันทึกไว้เฉย ๆ (agent เคลียร์กับ organizer เอง)
  customerName: string;
  customerEmail: string;
  createdAt: number;
}

interface AgentState {
  bookings: AgentBooking[];
  addBooking: (b: AgentBooking) => void;
  clearAll: () => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      bookings: [],
      addBooking: (b) => set((s) => ({ bookings: [b, ...s.bookings] })),
      clearAll: () => set({ bookings: [] }),
    }),
    { name: "ecn-agent-bookings" }
  )
);

// ตัวแทน (mock identity) — ภายหลังมาจาก Keycloak
export const AGENT = {
  name: "สมชาย ใจกว้าง",
  code: "AGT-001",
  company: "เชียงใหม่ ทราเวล",
};
