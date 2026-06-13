// affiliateAccountStore — สถานะการสมัครเป็นตัวแทนแนะนำ (persist)
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AffiliateProfile {
  name: string;
  email: string;
  phone: string;
  channel: string; // ช่องทาง/โซเชียลที่ใช้โปรโมต
}

interface AffiliateAccountState {
  registered: boolean;
  profile: AffiliateProfile | null;
  register: (p: AffiliateProfile) => void;
  reset: () => void;
}

export const useAffiliateAccountStore = create<AffiliateAccountState>()(
  persist(
    (set) => ({
      registered: false,
      profile: null,
      register: (p) => set({ registered: true, profile: p }),
      reset: () => set({ registered: false, profile: null }),
    }),
    { name: "ecn-affiliate-account" }
  )
);
