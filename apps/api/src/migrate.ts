// รัน migration ทั้งหมดใน migrations/*.sql (เรียงชื่อ) — idempotent (if not exists)
import { sql, closeDb } from "./db.ts";
import { readdir } from "node:fs/promises";

const dir = new URL("../migrations/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const f of files) {
  const text = await Bun.file(new URL(f, dir)).text();
  console.log(`[MIGRATE] applying ${f}`);
  await sql.unsafe(text); // simple query mode — รองรับหลายคำสั่งใน 1 ไฟล์
}
console.log(`[MIGRATE] done (${files.length} file)`);
await closeDb();
