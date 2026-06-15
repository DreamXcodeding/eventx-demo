// รัน migration ใส่ Neon — รัน local ด้วย: DATABASE_URL=... bun run migrate
// (Worker รัน migrate ไม่ได้ — DDL ทำจากเครื่อง dev/CI ครั้งเดียว)
import { neon } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) { console.error("[MIGRATE] ต้องตั้ง DATABASE_URL (Neon)"); process.exit(1); }
const sql = neon(url);

const dir = new URL("../migrations/", import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

// แยกเป็นคำสั่งทีละอัน (ตัด comment ออก) — Neon HTTP รันทีละ statement
const stripComments = (s: string) => s.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").trim();

for (const f of files) {
  const text = readFileSync(new URL(f, dir), "utf8");
  const stmts = text.split(";").map(stripComments).filter(Boolean);
  console.log(`[MIGRATE] applying ${f} (${stmts.length} statements)`);
  for (const s of stmts) await sql(s);
}
console.log(`[MIGRATE] done (${files.length} file)`);
