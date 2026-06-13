// affiliateStore — เก็บ ref code จาก ?ref=AFF001 (persist 30 วัน) แนบตอนสร้าง order
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AffiliateState {
  code: string | null;
  capturedAt: number | null;
  capture: (code: string) => void;
  clear: () => void;
}

export const useAffiliateStore = create<AffiliateState>()(
  persist(
    (set) => ({
      code: null,
      capturedAt: null,
      capture: (code) => set({ code, capturedAt: Date.now() }),
      clear: () => set({ code: null, capturedAt: null }),
    }),
    { name: "ecn-affiliate" }
  )
);
