// Mock user directory สำหรับ Admin → จัดการผู้ใช้
export type UserRole = "CUSTOMER" | "AGENT" | "AFFILIATE" | "ORGANIZER";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface DirUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
  orders: number; // จำนวนออเดอร์/การจองที่เกี่ยวข้อง
  note?: string;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  CUSTOMER: "ลูกค้า",
  AGENT: "ตัวแทน",
  AFFILIATE: "ตัวแทนแนะนำ",
  ORGANIZER: "ผู้จัดงาน",
};

export const USERS: DirUser[] = [
  { id: "u-1", name: "สมหญิง ใจดี", email: "somying@example.com", phone: "0812345678", role: "CUSTOMER", status: "ACTIVE", joined: "2026-05-02", orders: 3 },
  { id: "u-2", name: "อาทิตย์ แสงทอง", email: "arthit@example.com", phone: "0891112222", role: "CUSTOMER", status: "ACTIVE", joined: "2026-05-20", orders: 1 },
  { id: "u-3", name: "สมชาย ใจกว้าง", email: "agent@cnxtravel.co", phone: "0820001111", role: "AGENT", status: "ACTIVE", joined: "2026-03-15", orders: 28, note: "เชียงใหม่ ทราเวล (AGT-001)" },
  { id: "u-4", name: "สมหญิง อินฟลู", email: "aff@social.co", phone: "0830002222", role: "AFFILIATE", status: "ACTIVE", joined: "2026-02-10", orders: 229, note: "AFF001 · คอมมิชชั่น 10%" },
  { id: "u-5", name: "One Miracle Land", email: "contact@onemiracle.co", phone: "0530004444", role: "ORGANIZER", status: "ACTIVE", joined: "2026-01-08", orders: 1765, note: "ค่าดำเนินการ 7%" },
  { id: "u-6", name: "Lanna Live Co.", email: "info@lannalive.co", phone: "0891234567", role: "ORGANIZER", status: "ACTIVE", joined: "2026-06-11", orders: 0, note: "เพิ่งอนุมัติ · 7%" },
  { id: "u-7", name: "ทดสอบ ระงับ", email: "blocked@example.com", phone: "0800009999", role: "CUSTOMER", status: "SUSPENDED", joined: "2026-04-01", orders: 0, note: "ระงับ: รายงานทุจริต" },
  { id: "u-8", name: "BKK Concerts", email: "hello@bkkconcerts.co", phone: "0822345678", role: "ORGANIZER", status: "ACTIVE", joined: "2026-05-28", orders: 0, note: "กำลังคุยดีล" },
];
