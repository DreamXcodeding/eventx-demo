// PostgreSQL (Neon serverless) บน Cloudflare Workers · ใช้ ? placeholder (แปลงเป็น $n)
// อ่าน DATABASE_URL ต่อ request ผ่าน hono/context-storage → routes ใช้ all/get/run เหมือนเดิม
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { getContext } from "hono/context-storage";
import type { Env } from "./env.ts";

export type Param = string | number | bigint | boolean | null;

const toPg = (q: string): string => { let i = 0; return q.replace(/\?/g, () => `$${++i}`); };

// memoize client ต่อ connection string (HTTP driver — stateless, ไม่มี persistent connection)
let cachedUrl: string | undefined;
let cachedSql: NeonQueryFunction<false, false> | undefined;
const client = (): NeonQueryFunction<false, false> => {
  const url = getContext<{ Bindings: Env }>().env.DATABASE_URL;
  if (!cachedSql || cachedUrl !== url) { cachedUrl = url; cachedSql = neon(url); }
  return cachedSql;
};

export const all = async <T = Record<string, unknown>>(q: string, ...p: Param[]): Promise<T[]> =>
  (await client()(toPg(q), p as unknown[])) as T[];

export const get = async <T = Record<string, unknown>>(q: string, ...p: Param[]): Promise<T | undefined> =>
  ((await client()(toPg(q), p as unknown[]))[0] as T | undefined) ?? undefined;

export const run = async (q: string, ...p: Param[]): Promise<void> => {
  await client()(toPg(q), p as unknown[]);
};

// transaction: ส่ง array ของ [sql, params] → รันเป็นก้อนเดียว (atomic) ผ่าน Neon
export const txn = async (queries: Array<[string, Param[]]>): Promise<void> => {
  const sql = client();
  await sql.transaction(queries.map(([t, p]) => sql(toPg(t), p as unknown[])));
};
