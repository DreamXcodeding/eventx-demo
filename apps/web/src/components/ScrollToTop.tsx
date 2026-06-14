import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAffiliateCapture } from "../lib/useAffiliateCapture";

// เลื่อนขึ้นบนสุดทุกครั้งที่เปลี่ยนเส้นทาง + จับ ?ref ของ affiliate (global ทุกหน้า)
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useAffiliateCapture();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}
