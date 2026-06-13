// Mock data (frontend-demo phase) — โครงตาม DATABASE_SCHEMA.md
// ECN = marketplace หลายอีเวนต์ (แนว Klook) · สลับเป็น API จริงภายหลังผ่าน packages/api-client
import { asset } from "../lib/asset";

export type TicketKind = "VIP" | "PREMIUM" | "STANDARD" | "GROUP" | "EARLY_BIRD";
export type Accent = "lantern" | "fireworks" | "krathong" | "concert" | "art" | "outdoor";
export type SaleStatus = "ON_SALE" | "COMING_SOON" | "SOLD_OUT";

export interface TicketType {
  id: string;
  kind: TicketKind;
  name: string;
  price: number; // บาท (demo ใช้บาทเต็มเพื่ออ่านง่าย)
  perks: string[];
  badge?: string;
}

export interface EcnEvent {
  id: string;
  slug: string;
  title: string;
  province: string;
  venue: string;
  category: string;
  dateLabel: string;
  timeLabel?: string;
  priceFrom: number;
  rating: number;
  reviews: number;
  badge?: string;
  accent: Accent;
  image?: string; // รูปจริง (ถ้ามี) แทน gradient thumbnail
  status: SaleStatus;
  featured?: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  venue: string;
  priceFrom?: number;
  cta: string;
  slug: string; // ลิงก์ไปหน้า event detail
  accent: Accent;
  image?: string; // โปสเตอร์/แบนเนอร์จริง
}

// ── หมวดหมู่ (icon = emoji placeholder สำหรับ demo) ───────────────
export const CATEGORIES = [
  { key: "all", label: "ทั้งหมด", icon: "✦" },
  { key: "festival", label: "เทศกาลแสงสี", icon: "🏮" },
  { key: "concert", label: "คอนเสิร์ต", icon: "🎵" },
  { key: "workshop", label: "เวิร์กช็อป", icon: "🎨" },
  { key: "exhibition", label: "นิทรรศการ", icon: "🖼️" },
  { key: "outdoor", label: "กลางแจ้ง", icon: "⛰️" },
];

// ── ปลายทางยอดนิยม ───────────────────────────────────────────────
export const DESTINATIONS = [
  { name: "เชียงใหม่", count: 1, accent: "lantern" as Accent },
];

// ── อีเวนต์เด่น (hero banner) = งานแรกของระบบ ─────────────────────
export const FEATURED_EVENT = {
  id: "evt-cnx-loy-krathong-2026",
  slug: "cnx-loy-krathong-2026",
  title: "CNX Loy Krathong",
  year: "2026",
  tagline: "One Sky · Thousand Wishes",
  subtitleTh: "ปล่อยโคมลอย ลอยกระทง ใต้แสงจันทร์เต็มดวง",
  presenter: "Cnx Miracle Land Festival",
  dateLabel: "24–25 พฤศจิกายน 2569",
  province: "เชียงใหม่",
  venue: "One Miracle Land, เชียงใหม่",
  poster: asset("/cnx/fg-hero.png"),
  titleLogoWhite: asset("/cnx/title-white.png"),
  festivalLogo: asset("/cnx/festival-logo.png"),
  priceFrom: 9800,
  rating: 4.9,
  reviews: 1284,
  ticketTypes: [
    { id: "tt-cnx", kind: "STANDARD" as TicketKind, name: "บัตรเข้างาน", price: 9800, perks: ["บัตรเข้างานต่อท่าน", "คูปองอาหารภายในงาน", "โคมลอย + กระทง", "ชมพลุและการแสดง"] },
  ] satisfies TicketType[],
  highlights: [
    { icon: "🏮", title: "ปล่อยโคมลอยพร้อมกัน", desc: "นับพันดวงสู่ท้องฟ้ายามค่ำคืน" },
    { icon: "🪷", title: "ลอยกระทงริมน้ำ", desc: "อธิษฐานขอพรใต้แสงจันทร์เต็มดวง" },
    { icon: "🎆", title: "พลุเฉลิมฉลอง", desc: "การแสดงพลุตระการตาทั้งสองคืน" },
    { icon: "🎭", title: "การแสดงวัฒนธรรม", desc: "ระบำล้านนา ดนตรีพื้นเมือง" },
  ],
};

// ── คลังอีเวนต์ (marketplace) ────────────────────────────────────
// mock: เหลือเฉพาะงาน CNX Loy Krathong 2026 อย่างเดียวก่อน
export const EVENTS: EcnEvent[] = [
  { id: "evt-cnx-loy-krathong-2026", slug: "cnx-loy-krathong-2026", title: "CNX Loy Krathong 2026", province: "เชียงใหม่", venue: "แม่ออน, เชียงใหม่", category: "festival", dateLabel: "24-25 พ.ย. 2569", timeLabel: "16:00 - 23:00 น.", priceFrom: 9800, rating: 4.9, reviews: 1284, badge: "ขายดี", accent: "lantern", image: asset("/cnx/poster.jpg"), status: "ON_SALE" },
];

// Hero banner carousel (แนว EventPass) — เหลือ CNX อย่างเดียว
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "hs-cnx",
    title: "CNX Loy Krathong 2026",
    subtitle: "Experience Thailand’s Most Exclusive Sky Lantern Festival",
    dateLabel: "24-25 พ.ย. 2569",
    venue: "แม่ออน, เชียงใหม่",
    priceFrom: 9800,
    cta: "ซื้อบัตร",
    slug: "cnx-loy-krathong-2026",
    accent: "lantern",
    image: asset("/cnx/fg-hero.png"),
  },
];

export const formatTHB = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(amount);

export const categoryLabel = (key: string) =>
  CATEGORIES.find((c) => c.key === key)?.label ?? key;
