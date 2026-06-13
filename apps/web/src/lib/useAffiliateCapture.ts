// จับ ?ref=AFF001 จาก URL → เก็บลง affiliateStore (persist) เพื่อแนบตอนสร้าง order
import { useEffect } from "react";
import { useAffiliateStore } from "../stores/affiliateStore";

export function useAffiliateCapture() {
  const capture = useAffiliateStore((s) => s.capture);
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) capture(ref);
  }, [capture]);
}
