// Mock organizer (PARTNER ที่อนุมัติแล้ว) + งาน + ยอดขาย — สำหรับ Organizer dashboard
export interface OrgEventSales {
  id: string;
  slug: string;
  title: string;
  dateLabel: string;
  price: number; // บาท
  quota: number;
  sold: number;
  checkedIn: number;
  status: "ON_SALE" | "ENDED";
}

export const ORGANIZER = {
  id: "org-cnx",
  company: "One Miracle Land Festival",
  contact: "คุณมิราเคิล",
  feeBps: 700, // ค่าดำเนินการ ECN 7%
};

export const ORG_EVENTS: OrgEventSales[] = [
  { id: "oe-1", slug: "cnx-loy-krathong-2026", title: "CNX Loy Krathong 2026", dateLabel: "24–25 พ.ย. 2569", price: 9800, quota: 1500, sold: 842, checkedIn: 0, status: "ON_SALE" },
];

export const revenueOf = (e: OrgEventSales) => e.price * e.sold;
