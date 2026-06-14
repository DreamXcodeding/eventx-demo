// รัน migration ทั้งหมดใน migrations/*.sql (เรียงชื่อ) — idempotent (if not exists)
import { db } from "./db.ts";
import { readdir } from "node:fs/promises";

const dir = new URL("../migrations/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const f of files) {
  const text = await Bun.file(new URL(f, dir)).text();
  console.log(`[MIGRATE] applying ${f}`);
  db.exec(text); // ไฟล์ของเราเอง (หลายคำสั่ง)
}
console.log(`[MIGRATE] done (${files.length} file)`);
