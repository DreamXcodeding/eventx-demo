// Event detail builder (mock) — CNX ใช้ข้อมูลจริง · งานอื่น synth จาก EcnEvent
import { EVENTS, FEATURED_EVENT, type Accent, type SaleStatus, type TicketType } from "./events";
import { asset } from "../lib/asset";

export interface EventSession {
  id: string;
  label: string;
  dateLabel: string;
}
export interface FaqItem {
  q: string;
  a: string;
}
export interface EventDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  presenter?: string;
  province: string;
  venue: string;
  locationLabel?: string; // ป้ายสถานที่ในหน้า (Figma: "แม่ออน, เชียงใหม่")
  dateLabel: string;
  timeLabel?: string; // เวลาเริ่ม-เลิกงาน
  status: SaleStatus;
  rating: number;
  reviews: number;
  accent: Accent;
  image?: string;
  gallery?: string[]; // รูปบรรยากาศภายในงาน
  description: string;
  highlights: { icon: string; title: string; desc: string }[];
  sessions: EventSession[];
  ticketTypes: TicketType[];
  faq: FaqItem[];
  terms: string[];
}

const round = (n: number) => Math.round(n / 10) * 10;

const GENERIC_FAQ: FaqItem[] = [
  { q: "บัตรส่งอย่างไร?", a: "หลังชำระเงินสำเร็จ ระบบจะส่งบัตร QR ไปยังอีเมลของคุณทันที และดูได้ที่เมนู ‘ตั๋วของฉัน’" },
  { q: "เปลี่ยน/คืนบัตรได้ไหม?", a: "บัตรไม่สามารถคืนเงินได้ แต่สามารถเปลี่ยนชื่อผู้เข้างานได้ก่อนวันงาน 3 วัน" },
  { q: "เข้างานต้องใช้อะไร?", a: "แสดงบัตร QR (บนมือถือหรือพิมพ์) ที่จุดสแกนหน้างาน" },
];
const GENERIC_TERMS = [
  "บัตร 1 ใบ สำหรับเข้างาน 1 ท่าน",
  "กรุณามาถึงก่อนเวลาเริ่มงานอย่างน้อย 30 นาที",
  "ผู้จัดงานขอสงวนสิทธิ์ในการเปลี่ยนแปลงรายละเอียดงานโดยไม่ต้องแจ้งล่วงหน้า",
  "บัตรที่ซื้อแล้วไม่สามารถขอคืนเงินได้",
];

// ── CNX (เนื้อหาจริงตาม Figma) ────────────────────────────────────
const CNX_FAQ: FaqItem[] = [
  { q: "ซื้อบัตรแล้วสามารถเลือกวันได้ไหม?", a: "ได้เลย! บัตรแต่ละใบระบุวันเข้างานชัดเจน คุณสามารถเลือกซื้อบัตรสำหรับคืนแรก (24 พ.ย.) หรือคืนที่สอง (25 พ.ย.) ได้ตามต้องการ" },
  { q: "มีที่จอดรถหรือบริการรับ-ส่งไหม?", a: "มีบริการรถรับ-ส่งจากจุดนัดพบในตัวเมืองเชียงใหม่สู่สถานที่จัดงาน และมีลานจอดรถสำหรับผู้ที่ขับรถมาเอง" },
  { q: "เด็กเล็กต้องซื้อบัตรหรือเปล่า?", a: "เด็กอายุต่ำกว่า 3 ปี เข้างานฟรี (ไม่มีที่นั่ง) เด็กตั้งแต่ 3 ปีขึ้นไปต้องใช้บัตร 1 ใบต่อท่าน" },
  { q: "ถ้าฝนตกจะจัดงานต่อหรือยกเลิก?", a: "งานจัดในพื้นที่ที่เตรียมรับมือสภาพอากาศไว้แล้ว หากมีเหตุสุดวิสัยจนต้องยกเลิก ทีมงานจะแจ้งและดำเนินการตามนโยบายคืนเงิน/เลื่อนงาน" },
  { q: "ชำระเงินด้วยวิธีใดได้บ้าง?", a: "รองรับ PromptPay บัตรเครดิต/เดบิต และช่องทางอื่นผ่านระบบชำระเงินที่ปลอดภัย" },
];
const CNX_TERMS = [
  "ห้ามนำสัตว์เลี้ยงเข้า",
  "ห้ามนำเครื่องดื่มแอลกอฮอล์เข้า",
  "ห้ามนำพลุหรือดอกไม้ไฟจากภายนอกเข้างาน",
  "ไม่อนุญาตกระทงโฟม ใช้เฉพาะกระทงธรรมชาติที่จัดเตรียมไว้",
  "ห้ามใช้ลำโพงพกพาในพื้นที่พิธีลอยกระทง",
  "จำกัด 800 คน/วัน",
  "ไม่มีการขายที่หน้างาน ต้องจองล่วงหน้าเท่านั้น",
];

export function getEventDetail(slug: string): EventDetail | undefined {
  // ── CNX (ข้อมูลจริง) ─────────────────────────────
  if (slug === FEATURED_EVENT.slug) {
    const f = FEATURED_EVENT;
    return {
      id: f.id,
      slug: f.slug,
      title: `${f.title} ${f.year}`,
      subtitle: "เทศกาลปล่อนโคมยี่เป็งที่ยิ่งใหญ่และสวยงามที่สุดของไทย สัมผัสประสบการณ์แห่งศรัทธาบนท้องฟ้าเชียงใหม่",
      presenter: f.presenter,
      province: f.province,
      venue: "One Miracle Land",
      locationLabel: "แม่ออน, เชียงใหม่",
      dateLabel: "24-25 พ.ย. 2569",
      timeLabel: "16:00 - 23:00 น.",
      status: "ON_SALE",
      rating: f.rating,
      reviews: f.reviews,
      accent: "lantern",
      image: f.poster,
      gallery: [asset("/cnx/fg-gal-2.png"), asset("/cnx/fg-gal-1.png"), asset("/cnx/fg-gal-3.png")],
      description:
        "ร่วมเป็นส่วนหนึ่งของค่ำคืนมหัศจรรย์แห่งแสงไฟที่ยิ่งใหญ่ที่สุดของเชียงใหม่ ปล่อยโคมลอยนับพันดวงสู่ท้องฟ้า ลอยกระทงอธิษฐานริมน้ำใต้แสงจันทร์เต็มดวง พร้อมการแสดงพลุ ดนตรี และวัฒนธรรมล้านนาตลอดสองคืน",
      highlights: [
        { icon: "📅", title: "2 วันเต็ม", desc: "24–25 พ.ย. ตั้งแต่ 16:00–23:00 น." },
        { icon: "🏮", title: "จุดปล่อยโคมพิเศษ", desc: "พื้นที่ปล่อยโคมที่จัดเตรียมไว้โดยเฉพาะ" },
        { icon: "🎆", title: "การแสดงแสงสี", desc: "พลุและการแสดงตระการตาทั้งสองคืน" },
        { icon: "🚐", title: "บริการรับ-ส่ง", desc: "รถรับ-ส่งจากจุดนัดพบสู่สถานที่จัดงาน" },
        { icon: "🎁", title: "สิทธิพิเศษมากมาย", desc: "โคมลอย กระทง และคูปองอาหารในงาน" },
      ],
      sessions: [
        { id: "ses-d1", label: "คืนแรก", dateLabel: "24 พ.ย. 2569 17:00-23:00" },
        { id: "ses-d2", label: "คืนที่สอง", dateLabel: "25 พ.ย. 2569 17:00-23:00" },
      ],
      ticketTypes: f.ticketTypes,
      faq: CNX_FAQ,
      terms: CNX_TERMS,
    };
  }

  // ── งานอื่น (synth จาก EcnEvent) ──────────────────
  const e = EVENTS.find((x) => x.slug === slug);
  if (!e) return undefined;

  const ticketTypes: TicketType[] = [
    { id: `${e.id}-std`, kind: "STANDARD", name: "Standard", price: e.priceFrom, perks: ["เข้างาน 1 ท่าน", "ที่นั่งโซนทั่วไป"] },
    { id: `${e.id}-prm`, kind: "PREMIUM", name: "Premium", price: round(e.priceFrom * 1.7), badge: "ยอดนิยม", perks: ["เข้างาน 1 ท่าน", "ที่นั่งโซนพิเศษ", "เครื่องดื่มต้อนรับ"] },
    { id: `${e.id}-vip`, kind: "VIP", name: "VIP", price: round(e.priceFrom * 2.7), perks: ["เข้างาน 1 ท่าน", "ที่นั่งโซน VIP", "ของที่ระลึก", "ทางเข้าพิเศษ"] },
  ];

  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    province: e.province,
    venue: e.venue,
    dateLabel: e.dateLabel,
    status: e.status,
    rating: e.rating,
    reviews: e.reviews,
    accent: e.accent,
    image: e.image,
    description: `สัมผัสประสบการณ์สุดพิเศษกับ ${e.title} ที่ ${e.venue} จังหวัด${e.province} จองบัตรล่วงหน้าผ่าน EventX รับบัตร QR ทางอีเมลทันที`,
    highlights: [
      { icon: "🎟️", title: "จองง่าย ปลอดภัย", desc: "ชำระเงินผ่านระบบที่ปลอดภัย" },
      { icon: "📱", title: "บัตร QR ดิจิทัล", desc: "ไม่ต้องพิมพ์ สแกนเข้างานได้เลย" },
      { icon: "⭐", title: "ประสบการณ์คัดสรร", desc: "อีเวนต์คุณภาพจากผู้จัดงานชั้นนำ" },
    ],
    sessions: [{ id: `${e.id}-ses`, label: "รอบการแสดง", dateLabel: e.dateLabel }],
    ticketTypes,
    faq: GENERIC_FAQ,
    terms: GENERIC_TERMS,
  };
}
