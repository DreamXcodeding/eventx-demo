// จับ ?ref=AFF001 จาก URL → เก็บลง affiliateStore (persist) เพื่อแนบตอนสร้าง order
import { useEffect } from "react";
import { useAffiliateStore } from "../stores/affiliateStore";
import { api } from "./api";
import { USE_MOCK } from "./http";

export function useAffiliateCapture() {
  const capture = useAffiliateStore((s) => s.capture);
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      capture(ref);
      if (!USE_MOCK) api.affiliate.track(ref).catch(() => { /* ไม่บล็อก UX ถ้า track fail */ });
    }
  }, [capture]);
}
