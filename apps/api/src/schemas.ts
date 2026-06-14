// Zod schemas — validate ทุก input จาก client ก่อนใช้งาน
import { z } from "zod";

export const phoneSchema = z.string().regex(/^0\d{8,9}$/, "เบอร์โทรไม่ถูกต้อง (ขึ้นต้น 0 ตามด้วย 8-9 หลัก)");

export const requestOtpSchema = z.object({ phone: phoneSchema });
export const verifyOtpSchema = z.object({ phone: phoneSchema, code: z.string().regex(/^\d{6}$/, "รหัส OTP ต้องเป็นเลข 6 หลัก") });
export const registerSchema = z.object({
  name: z.string().trim().min(2, "กรอกชื่อ").max(120),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  phone: phoneSchema,
});
export const socialSchema = z.object({ provider: z.enum(["google", "email"]), name: z.string().optional(), email: z.string().email().optional() });

export const orderItemSchema = z.object({
  ticketTypeId: z.string().min(1),
  sessionId: z.string().optional(),
  quantity: z.number().int().min(1).max(10),
});
export const createOrderSchema = z.object({
  eventSlug: z.string().min(1),
  items: z.array(orderItemSchema).min(1, "เลือกบัตรอย่างน้อย 1 ใบ"),
  buyer: z.object({
    name: z.string().trim().min(1),
    phone: phoneSchema,
    email: z.string().email(),
  }),
  affiliateCode: z.string().trim().max(40).optional().nullable(),
});

export const checkinSchema = z.object({ ticketNo: z.string().trim().min(3) });

export const affiliateApplySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phone: phoneSchema,
  channel: z.string().trim().min(1).max(120),
});
export const trackSchema = z.object({ code: z.string().trim().min(1).max(40) });
