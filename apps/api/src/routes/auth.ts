// Auth: phone OTP (demo รับเลข 6 หลักใดก็ได้), register, social, me
import { Hono } from "hono";
import { get, run } from "../db.ts";
import { ok, ApiError } from "../lib/response.ts";
import { signToken, requireAuth, type JwtUser, type Role } from "../lib/auth.ts";
import { requestOtpSchema, verifyOtpSchema, registerSchema, socialSchema, assumeRoleSchema } from "../schemas.ts";

const r = new Hono();

type UserRow = { id: string; name: string; email: string | null; phone: string | null; role: Role };
const toJwt = (u: UserRow): JwtUser => ({ id: u.id, name: u.name, email: u.email ?? "", phone: u.phone ?? undefined, role: u.role });

// หา user จาก phone หรือสร้างใหม่ (ถ้า phone ตรงกับ affiliate → role AFFILIATE)
async function upsertUserByPhone(phone: string, name?: string, email?: string): Promise<JwtUser> {
  const existing = await get<UserRow>("select id, name, email, phone, role from users where phone = ? limit 1", phone);
  if (existing) return toJwt(existing);
  const aff = await get("select 1 as x from affiliates a join users u on u.id = a.user_id where u.phone = ? limit 1", phone);
  const role: Role = aff ? "AFFILIATE" : "CUSTOMER";
  const id = crypto.randomUUID();
  await run("insert into users (id, name, email, phone, role) values (?,?,?,?,?)", id, name ?? "คุณลูกค้า", email ?? null, phone, role);
  return { id, name: name ?? "คุณลูกค้า", email: email ?? "", phone, role };
}

r.post("/request-otp", async (c) => {
  const body = requestOtpSchema.parse(await c.req.json());
  return ok(c, { sent: true, phone: body.phone, hint: "demo — กรอกเลข 6 หลักใดก็ได้" });
});

r.post("/verify-otp", async (c) => {
  const { phone } = verifyOtpSchema.parse(await c.req.json());
  const user = await upsertUserByPhone(phone);
  return ok(c, { token: await signToken(user), user });
});

r.post("/register", async (c) => {
  const body = registerSchema.parse(await c.req.json());
  if (await get("select 1 as x from users where phone = ? limit 1", body.phone))
    throw new ApiError(409, "CONFLICT", "เบอร์นี้ถูกใช้สมัครแล้ว กรุณาเข้าสู่ระบบ");
  const user = await upsertUserByPhone(body.phone, body.name, body.email);
  return ok(c, { token: await signToken(user), user }, 201);
});

r.post("/social", async (c) => {
  const body = socialSchema.parse(await c.req.json());
  const email = body.email ?? `${body.provider}@eventx.demo`;
  let user = await get<UserRow>("select id, name, email, phone, role from users where email = ? limit 1", email);
  if (!user) {
    const id = crypto.randomUUID();
    const name = body.name ?? `ผู้ใช้ ${body.provider}`;
    await run("insert into users (id, name, email, role) values (?,?,?, 'CUSTOMER')", id, name, email);
    user = { id, name, email, phone: null, role: "CUSTOMER" };
  }
  return ok(c, { token: await signToken(toJwt(user)), user: toJwt(user) });
});

r.get("/me", requireAuth, (c) => ok(c, { user: c.get("user") }));

// DEMO ONLY — รับ role agent/organizer/admin เพื่อเข้า portal (production: ใช้ onboarding/IdP จริง)
r.post("/dev-assume-role", requireAuth, async (c) => {
  const { role } = assumeRoleSchema.parse(await c.req.json());
  const current = c.get("user") as JwtUser;
  await run("update users set role = ? where id = ?", role, current.id);
  const user: JwtUser = { ...current, role };
  return ok(c, { token: await signToken(user), user });
});

export default r;
