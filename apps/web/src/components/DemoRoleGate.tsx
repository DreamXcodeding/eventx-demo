// DemoRoleGate — real mode: ต้องมี role ที่กำหนดก่อนเข้า portal (เรียก dev-assume-role)
// mock mode: ผ่านตรง ๆ (demo GitHub Pages ไม่กระทบ)
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";
import { api } from "../lib/api";
import { USE_MOCK } from "../lib/http";

type PortalRole = "AGENT" | "ORGANIZER" | "ADMIN";
const ROLE_LABEL: Record<PortalRole, string> = { AGENT: "Agent (ตัวแทน)", ORGANIZER: "Organizer (ผู้จัดงาน)", ADMIN: "Admin (ผู้ดูแลระบบ)" };

export default function DemoRoleGate({ role, children }: { role: PortalRole; children: ReactNode }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const openLogin = useUiStore((s) => s.openLogin);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (USE_MOCK) return <>{children}</>;

  // ADMIN เข้าได้ทุก portal · role อื่นต้องตรง
  const allowed = !!user && (user.role === role || (role !== "ADMIN" && user.role === "ADMIN"));
  if (allowed) return <>{children}</>;

  const assume = async () => {
    setBusy(true); setErr("");
    try { const { token, user: u } = await api.auth.assumeRole(role); login(token, u); }
    catch (e) { setErr((e as { message?: string })?.message ?? t("portal.failed")); }
    finally { setBusy(false); }
  };

  const path = (window.location.pathname.replace(import.meta.env.BASE_URL.replace(/\/$/, ""), "") || "/");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center shadow-e2">
        <span className="font-display text-2xl font-bold tracking-tight text-brand-gradient">EventX</span>
        <h1 className="mt-4 text-lg font-semibold text-ink">{t("portal.title", { role: ROLE_LABEL[role] })}</h1>
        <p className="mt-1 text-[13px] text-slate">{t("portal.sub")}</p>
        {!isAuth ? (
          <button onClick={() => openLogin(path)} className="mt-5 w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white shadow-brand transition-all hover:opacity-95 active:scale-[0.98]">
            {t("portal.loginFirst")}
          </button>
        ) : (
          <button onClick={assume} disabled={busy} className="mt-5 w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white shadow-brand transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50">
            {busy ? t("login.pleaseWait") : t("portal.enter", { role: ROLE_LABEL[role] })}
          </button>
        )}
        {err && <p role="alert" className="mt-3 text-[12px] text-error">{err}</p>}
        <p className="mt-3 text-[11px] text-muted">{t("portal.note")}</p>
      </div>
    </div>
  );
}
