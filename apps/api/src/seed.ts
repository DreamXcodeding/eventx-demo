// seed ข้อมูล demo: งาน CNX Loy Krathong 2026 + รายละเอียด + affiliate AFF001
// idempotent: ลบงาน slug เดิม (cascade) แล้ว insert ใหม่
import { run, get, closeDb } from "./db.ts";

const SLUG = "cnx-loy-krathong-2026";
await run("delete from events where slug = ?", SLUG);

const eid = crypto.randomUUID();
await run(
  `insert into events (id, slug, title, subtitle, presenter, province, venue, location_label, date_label, time_label,
    category, accent, status, rating, reviews, price_from, image, badge, description)
   values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  eid, SLUG, "CNX Loy Krathong 2026",
  "เทศกาลปล่อนโคมยี่เป็งที่ยิ่งใหญ่และสวยงามที่สุดของไทย สัมผัสประสบการณ์แห่งศรัทธาบนท้องฟ้าเชียงใหม่",
  "Cnx Miracle Land Festival", "เชียงใหม่", "One Miracle Land", "แม่ออน, เชียงใหม่",
  "24-25 พ.ย. 2569", "16:00 - 23:00 น.", "festival", "lantern", "ON_SALE", 4.9, 1284, 9800,
  "/cnx/fg-hero.png", "ขายดี",
  "ร่วมเป็นส่วนหนึ่งของค่ำคืนมหัศจรรย์แห่งแสงไฟที่ยิ่งใหญ่ที่สุดของเชียงใหม่ ปล่อยโคมลอยนับพันดวงสู่ท้องฟ้า ลอยกระทงอธิษฐานริมน้ำใต้แสงจันทร์เต็มดวง พร้อมการแสดงพลุ ดนตรี และวัฒนธรรมล้านนาตลอดสองคืน"
);

const highlights: [string, string, string][] = [
  ["calendar", "2 วันเต็ม", "24–25 พ.ย. ตั้งแต่ 16:00–23:00 น."],
  ["star", "จุดปล่อยโคมพิเศษ", "พื้นที่ปล่อยโคมที่จัดเตรียมไว้โดยเฉพาะ"],
  ["restart", "การแสดงแสงสี", "พลุและการแสดงตระการตาทั้งสองคืน"],
  ["pin", "บริการรับ-ส่ง", "รถรับ-ส่งจากจุดนัดพบสู่สถานที่จัดงาน"],
  ["gift", "สิทธิพิเศษมากมาย", "โคมลอย กระทง และคูปองอาหารในงาน"],
];
for (let i = 0; i < highlights.length; i++) {
  const [icon, title, desc] = highlights[i];
  await run(`insert into event_highlights (event_id, icon, title, "desc", sort) values (?,?,?,?,?)`, eid, icon, title, desc, i);
}

const sessions: [string, string, string][] = [
  ["ses-d1", "คืนแรก", "24 พ.ย. 2569 17:00-23:00"],
  ["ses-d2", "คืนที่สอง", "25 พ.ย. 2569 17:00-23:00"],
];
for (let i = 0; i < sessions.length; i++) {
  const [code, label, date] = sessions[i];
  await run("insert into event_sessions (event_id, code, label, date_label, sort) values (?,?,?,?,?)", eid, code, label, date, i);
}

await run(
  "insert into ticket_types (event_id, code, kind, name, price, perks, sort) values (?,?,?,?,?,?,?)",
  eid, "tt-cnx", "STANDARD", "บัตรเข้างาน", 9800,
  JSON.stringify(["บัตรเข้างานต่อท่าน", "คูปองอาหารภายในงาน", "โคมลอย + กระทง", "ชมพลุและการแสดง"]), 0
);

const faq: [string, string][] = [
  ["ซื้อบัตรแล้วสามารถเลือกวันได้ไหม?", "ได้เลย! บัตรแต่ละใบระบุวันเข้างานชัดเจน คุณสามารถเลือกซื้อบัตรสำหรับคืนแรก (24 พ.ย.) หรือคืนที่สอง (25 พ.ย.) ได้ตามต้องการ"],
  ["มีที่จอดรถหรือบริการรับ-ส่งไหม?", "มีบริการรถรับ-ส่งจากจุดนัดพบในตัวเมืองเชียงใหม่สู่สถานที่จัดงาน และมีลานจอดรถสำหรับผู้ที่ขับรถมาเอง"],
  ["เด็กเล็กต้องซื้อบัตรหรือเปล่า?", "เด็กอายุต่ำกว่า 3 ปี เข้างานฟรี (ไม่มีที่นั่ง) เด็กตั้งแต่ 3 ปีขึ้นไปต้องใช้บัตร 1 ใบต่อท่าน"],
  ["ถ้าฝนตกจะจัดงานต่อหรือยกเลิก?", "งานจัดในพื้นที่ที่เตรียมรับมือสภาพอากาศไว้แล้ว หากมีเหตุสุดวิสัยจนต้องยกเลิก ทีมงานจะแจ้งและดำเนินการตามนโยบายคืนเงิน/เลื่อนงาน"],
  ["ชำระเงินด้วยวิธีใดได้บ้าง?", "รองรับ PromptPay บัตรเครดิต/เดบิต และช่องทางอื่นผ่านระบบชำระเงินที่ปลอดภัย"],
];
for (let i = 0; i < faq.length; i++) {
  const [q, a] = faq[i];
  await run("insert into event_faq (event_id, q, a, sort) values (?,?,?,?)", eid, q, a, i);
}

const terms = [
  "ห้ามนำสัตว์เลี้ยงเข้า", "ห้ามนำเครื่องดื่มแอลกอฮอล์เข้า", "ห้ามนำพลุหรือดอกไม้ไฟจากภายนอกเข้างาน",
  "ไม่อนุญาตกระทงโฟม ใช้เฉพาะกระทงธรรมชาติที่จัดเตรียมไว้", "ห้ามใช้ลำโพงพกพาในพื้นที่พิธีลอยกระทง",
  "จำกัด 800 คน/วัน", "ไม่มีการขายที่หน้างาน ต้องจองล่วงหน้าเท่านั้น",
];
for (let i = 0; i < terms.length; i++) {
  await run("insert into event_terms (event_id, text, sort) values (?,?,?)", eid, terms[i], i);
}

const gallery = ["/cnx/fg-gal-2.png", "/cnx/fg-gal-1.png", "/cnx/fg-gal-3.png"];
for (let i = 0; i < gallery.length; i++) {
  await run("insert into event_gallery (event_id, url, sort) values (?,?,?)", eid, gallery[i], i);
}

if (!(await get("select 1 as x from affiliates where code = ?", "AFF001")))
  await run("insert into affiliates (code, name, channel, rate_bps) values (?,?,?,?)", "AFF001", "สมหญิง อินฟลู", "Instagram / TikTok", 1000);

// Phase 3: โควต้าบัตร CNX (organizer dashboard) + ใบสมัคร organizer ตัวอย่าง
await run("update events set quota = 1500 where slug = ?", SLUG);

const orgCount = await get<{ c: number }>("select count(*)::int as c from organizer_apps");
if (!orgCount || orgCount.c === 0) {
  const orgs: [string, string, string, number, number | null, string][] = [
    ["Lanna Live Co.", "ปรีชา ศรีสุข", "0891234567", 2000, null, "DISCUSSING"],
    ["BKK Concerts", "วันดี ทองคำ", "0822345678", 8000, null, "DISCUSSING"],
    ["Phuket Events", "John Carter", "0833456789", 1200, 700, "APPROVED"],
  ];
  for (const [company, contact, phone, req, fee, status] of orgs)
    await run("insert into organizer_apps (company, contact, phone, requested_tickets, fee_bps, status) values (?,?,?,?,?,?)", company, contact, phone, req, fee, status);
}

console.log("[SEED] done — event CNX (quota 1500) + 5 highlights, 2 sessions, 1 ticket type, 5 faq, 7 terms, 3 gallery, affiliate AFF001, 3 organizer apps");
await closeDb();
