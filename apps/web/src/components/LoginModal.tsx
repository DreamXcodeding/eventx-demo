import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/uiStore";
import { useAuthStore } from "../stores/authStore";
import { useAffiliateAccountStore } from "../stores/affiliateAccountStore";

export default function LoginModal() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.loginOpen);
  const redirect = useUiStore((s) => s.loginRedirect);
  const closeLogin = useUiStore((s) => s.closeLogin);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const valid = /^0\d{8,9}$/.test(phone.trim());

  // ปิดด้วย Esc + ล็อก scroll พื้นหลัง
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLogin();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeLogin]);

  if (!open) return null;

  const finish = (name: string, email: string) => {
    // ถ้าเคยสมัคร affiliate ไว้ → ล็อกอินเป็น AFFILIATE และไปแดชบอร์ดของตัวเอง
    const isAffiliate = useAffiliateAccountStore.getState().registered;
    login("demo-token", { id: "u-demo", name, email, phone: phone || undefined, role: isAffiliate ? "AFFILIATE" : "CUSTOMER" });
    const target = redirect ?? (isAffiliate ? "/affiliate" : "/tickets");
    closeLogin();
    setPhone("");
    navigate(target);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* scrim */}
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={closeLogin} aria-hidden="true" />

      {/* card */}
      <div role="dialog" aria-modal="true" aria-label="เข้าสู่ระบบ" className="ecn-rise relative z-10 w-full max-w-sm rounded-2xl bg-white p-8 shadow-e3" style={{ animationDuration: "0.18s" }}>
        <button onClick={closeLogin} aria-label="ปิด" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div className="text-center">
          <span className="font-display text-3xl font-bold tracking-tight text-brand-gradient">EventX</span>
          <p className="-mt-1 text-[13px] font-medium tracking-widest text-muted">TICKET</p>
        </div>

        <h2 className="mt-5 text-center text-xl font-semibold text-ink">{t("login.title")}</h2>
        <p className="mt-1 text-center text-[13px] text-slate">{t("login.subtitle")}</p>

        {/* phone + +66 */}
        <div className="mt-5 flex items-center gap-2 rounded-full border border-line bg-white px-4 focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/10">
          <span className="flex items-center gap-1 text-[15px] font-medium text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
            +66
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={10}
            placeholder={t("login.phone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
        </div>

        <button
          onClick={() => finish("คุณลูกค้า", `${phone}@ecn.demo`)}
          disabled={!valid}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {t("login.otp")}
        </button>

        <div className="my-5 flex items-center gap-3 text-[12px] text-muted">
          <span className="h-px flex-1 border-t border-dashed border-line" /> {t("login.or")} <span className="h-px flex-1 border-t border-dashed border-line" />
        </div>

        <button onClick={() => finish("ผู้ใช้ Google", "demo@gmail.com")} className="mb-3 flex w-full items-center justify-center gap-3 rounded-full border border-line py-3 text-sm font-medium text-ink transition-colors hover:bg-surface">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.8Z" /><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23Z" /><path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2a11 11 0 0 0 0 9.8l3.7-2.8Z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2 7.1l3.7 2.8C6.6 7.4 9.1 5.4 12 5.4Z" /></svg>
          {t("login.google")}
        </button>
        <button onClick={() => finish("ผู้ใช้อีเมล", "demo@example.com")} className="flex w-full items-center justify-center gap-3 rounded-full border border-line py-3 text-sm font-medium text-ink transition-colors hover:bg-surface">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          {t("login.email")}
        </button>

        <p className="mt-5 text-center text-[12px] text-muted">{t("login.help")} <a href="#" className="text-brand hover:underline">{t("login.contact")}</a></p>
      </div>
    </div>
  );
}
