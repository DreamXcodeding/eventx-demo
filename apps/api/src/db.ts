// PostgreSQL (Bun.sql) — local Postgres 18 · ใช้ ? placeholder (แปลงเป็น $n อัตโนมัติ) กัน SQL injection
// (ออกแบบให้ย้าย dialect ได้ — โค้ด route ทั้งหมดยังเขียนด้วย ? เหมือนเดิม)
import { SQL } from "bun";
import { env } from "./env.ts";

export const sql = new SQL({ url: env.DATABASE_URL });

type Param = string | number | bigint | boolean | null | Date | Uint8Array;

// แปลง ? → $1,$2,... ให้ตรง dialect Postgres
const toPg = (q: string): string => { let i = 0; return q.replace(/\?/g, () => `$${++i}`); };

export const all = async <T = Record<string, unknown>>(q: string, ...p: Param[]): Promise<T[]> =>
  (await sql.unsafe(toPg(q), p as unknown[])) as T[];

export const get = async <T = Record<string, unknown>>(q: string, ...p: Param[]): Promise<T | undefined> =>
  ((await sql.unsafe(toPg(q), p as unknown[]))[0] as T | undefined) ?? undefined;

export const run = async (q: string, ...p: Param[]): Promise<void> => {
  await sql.unsafe(toPg(q), p as unknown[]);
};

// transaction: ส่งฟังก์ชัน run ที่ผูกกับ tx ให้ callback (atomic ทั้งก้อน)
export type TxRun = (q: string, ...p: Param[]) => Promise<unknown>;
export const transaction = async (fn: (run: TxRun) => Promise<void>): Promise<void> => {
  await sql.begin(async (tx) => {
    const trun: TxRun = (q, ...p) => tx.unsafe(toPg(q), p as unknown[]);
    await fn(trun);
  });
};

export const closeDb = (): Promise<void> => sql.end();
