// helper ตอบ response รูปแบบเดียวกันทั้งระบบ (ตรงกับที่ frontend http.ts คาดหวัง)
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const ok = <T>(c: Context, data: T, status: ContentfulStatusCode = 200) =>
  c.json({ success: true, data }, status);

export type ErrorCode =
  | "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
  | "CONFLICT" | "EXPIRED" | "RATE_LIMITED" | "INTERNAL_ERROR";

export const fail = (c: Context, status: ContentfulStatusCode, code: ErrorCode, message: string, details?: unknown) =>
  c.json({ success: false, error: { code, message, details } }, status);

// โยน error ที่ middleware กลางจับแล้วแปลงเป็น fail() ได้
export class ApiError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}
