// Banner โฆษณา (Ad placements) — mock data
// data-driven: เพิ่มโฆษณา = เพิ่มใน array · ภายหลังต่อ ad-serving / Sponsor module (DATABASE_SCHEMA: sponsors)
// placement: ตำแหน่งวางบนหน้าเว็บ

import type { Accent } from "./events";

export type AdPlacement = "strip" | "carousel" | "infeed";

export interface AdBanner {
  id: string;
  placement: AdPlacement;
  sponsor: string; // ผู้ลงโฆษณา
  title: string;
  subtitle?: string;
  cta: string;
  href: string;
  accent: Accent;
  emoji?: string;
  priority: number; // มากกว่า = แสดงก่อน
  active: boolean;
}

export const ADS: AdBanner[] = [
  // แถบประกาศบนสุด
  {
    id: "ad-strip-1",
    placement: "strip",
    sponsor: "EventX Pay",
    title: "จ่ายผ่าน PromptPay รับส่วนลด 5% ทุกบัตร ถึงสิ้นเดือนนี้",
    cta: "ดูเงื่อนไข",
    href: "#",
    accent: "krathong",
    priority: 10,
    active: true,
  },

  // คารูเซลโปรโมตด้านบน (หมุนอัตโนมัติ)
  {
    id: "ad-car-1",
    placement: "carousel",
    sponsor: "One Miracle Land",
    title: "Early Bird CNX Loy Krathong 2026",
    subtitle: "จองก่อน 31 ส.ค. รับโคมลอยฟรี 1 ใบ ทุกแพ็ก",
    cta: "จองราคาพิเศษ",
    href: "#",
    accent: "lantern",
    emoji: "🏮",
    priority: 9,
    active: true,
  },
  {
    id: "ad-car-2",
    placement: "carousel",
    sponsor: "Chang Music",
    title: "Neon Music Festival — บัตร Flash Sale",
    subtitle: "ลดสูงสุด 30% เฉพาะ 48 ชั่วโมง",
    cta: "ช้อปเลย",
    href: "#",
    accent: "fireworks",
    emoji: "🎆",
    priority: 8,
    active: true,
  },
  {
    id: "ad-car-3",
    placement: "carousel",
    sponsor: "TAT เชียงใหม่",
    title: "เที่ยวเชียงใหม่หน้าหนาว",
    subtitle: "แพ็กเกจอีเวนต์ + ที่พัก เริ่มต้น ฿2,990",
    cta: "ดูแพ็กเกจ",
    href: "#",
    accent: "outdoor",
    emoji: "⛰️",
    priority: 7,
    active: true,
  },

  // แบนเนอร์แทรกในฟีด
  {
    id: "ad-feed-1",
    placement: "infeed",
    sponsor: "SCB",
    title: "ผ่อน 0% นานสูงสุด 6 เดือน",
    subtitle: "เมื่อชำระด้วยบัตรเครดิตที่ร่วมรายการ บนทุกอีเวนต์ EventX",
    cta: "ดูบัตรที่ร่วมรายการ",
    href: "#",
    accent: "concert",
    emoji: "💳",
    priority: 6,
    active: true,
  },
];

export const adsByPlacement = (placement: AdPlacement) =>
  ADS.filter((a) => a.active && a.placement === placement).sort((a, b) => b.priority - a.priority);
