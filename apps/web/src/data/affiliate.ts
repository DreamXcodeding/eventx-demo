// Mock affiliate (PARTNER อินฟลู/ตัวแทนแนะนำ) + ลิงก์ + คอมมิชชั่น — สำหรับ Affiliate dashboard
// อ้างอิง ECN-Technical-Design: commission เฉพาะ AFFILIATE, ล็อกตอน order.PAID, จ่ายตอน settlement
export interface ReferralLink {
  id: string;
  code: string;
  eventTitle: string;
  slug: string;
  clicks: number;
  orders: number;
  revenue: number; // บาท
}

export interface CommissionRow {
  id: string;
  orderNo: string;
  eventTitle: string;
  base: number; // บาท
  amount: number; // บาท (base × rate)
  status: "PENDING" | "SETTLED";
  date: string;
}

export const AFFILIATE = {
  code: "AFF001",
  name: "สมหญิง อินฟลู",
  rateBps: 1000, // 10%
};

export const REFERRAL_LINKS: ReferralLink[] = [
  { id: "rl-1", code: "AFF001", eventTitle: "CNX Loy Krathong 2026", slug: "cnx-loy-krathong-2026", clicks: 1820, orders: 142, revenue: 1391600 },
];

export const COMMISSIONS: CommissionRow[] = [
  { id: "c-1", orderNo: "EVX-2026-004821", eventTitle: "CNX Loy Krathong 2026", base: 9800, amount: 980, status: "PENDING", date: "12 มิ.ย. 2026" },
  { id: "c-2", orderNo: "EVX-2026-004790", eventTitle: "CNX Loy Krathong 2026", base: 19600, amount: 1960, status: "PENDING", date: "11 มิ.ย. 2026" },
  { id: "c-3", orderNo: "EVX-2026-004702", eventTitle: "CNX Loy Krathong 2026", base: 5000, amount: 500, status: "SETTLED", date: "5 มิ.ย. 2026" },
];

// ผู้ใช้ที่สมัคร/ซื้อผ่านลิงก์แนะนำของ affiliate รายนี้
export interface ReferredUser {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: number; // บาท ที่ผู้ใช้คนนี้จ่าย
  commission: number; // บาท คอมที่ affiliate ได้จากผู้ใช้คนนี้
}

export const REFERRED_USERS: ReferredUser[] = [
  { id: "ru-1", name: "สมหญิง ใจดี", email: "som•••@example.com", joined: "12 มิ.ย. 2026", orders: 2, spent: 19600, commission: 1960 },
  { id: "ru-2", name: "อาทิตย์ แสงทอง", email: "art•••@example.com", joined: "11 มิ.ย. 2026", orders: 1, spent: 9800, commission: 980 },
  { id: "ru-3", name: "วิภา ทองคำ", email: "wip•••@gmail.com", joined: "9 มิ.ย. 2026", orders: 3, spent: 7500, commission: 750 },
  { id: "ru-4", name: "ก้อง มหาชัย", email: "kon•••@gmail.com", joined: "5 มิ.ย. 2026", orders: 1, spent: 5000, commission: 500 },
  { id: "ru-5", name: "นภา ศรีทอง", email: "nap•••@hotmail.com", joined: "1 มิ.ย. 2026", orders: 1, spent: 1500, commission: 150 },
];

export const baseUrl = "https://eventx.co.th";
