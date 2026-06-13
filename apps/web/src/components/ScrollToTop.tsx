import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// เลื่อนขึ้นบนสุดทุกครั้งที่เปลี่ยนเส้นทาง
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}
