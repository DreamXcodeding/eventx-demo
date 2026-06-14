// SQLite (bun:sqlite) — รันได้ทันทีไม่ต้องติดตั้ง DB · ใช้ ? placeholder กัน SQL injection
// (ออกแบบให้ย้ายไป Postgres ภายหลังได้ — เปลี่ยนเฉพาะไฟล์นี้ + dialect ใน migration)
import { Database } from "bun:sqlite";
import { env } from "./env.ts";

export const db = new Database(env.DATABASE_FILE, { create: true });
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

type Param = string | number | bigint | boolean | null | Uint8Array;

export const all = <T = Record<string, unknown>>(sql: string, ...p: Param[]): T[] => db.query(sql).all(...p) as T[];
export const get = <T = Record<string, unknown>>(sql: string, ...p: Param[]): T | undefined =>
  (db.query(sql).get(...p) as T | null) ?? undefined;
export const run = (sql: string, ...p: Param[]) => db.query(sql).run(...p);
