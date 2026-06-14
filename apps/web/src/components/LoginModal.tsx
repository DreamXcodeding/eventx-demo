import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/uiStore";
import { useAuthStore, type AuthUser } from "../stores/authStore";
import { useAffiliateAccountStore } from "../stores/affiliateAccountStore";
import { api, type AuthResult } from "../lib/api";
import { USE_MOCK } from "../lib/http";

type Step = "form" | "otp";

export default function LoginModal() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.loginOpen);
  const redirect = useUiStore((s) => s.loginRedirect);
  const initialMode = useUiStore((s) => s.loginMode);
  const closeLogin = useUiStore((s) => s.closeLogin);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<Step>("form");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // reset state ทุกครั้งที่เปิด + ตั้ง mode ตามที่กดมา
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setStep("form");
      setPhone(""); setOtp(""); setName(""); setEmail(""); setTouched(false); setBusy(false); setErr("");
    }
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLogin();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, closeLogin]);

  if (!open) return null;

  const phoneOk = /^0\d{8,9}$/.test(phone.trim());
  const otpOk = /^\d{6}$/.test(otp.trim());
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const regOk = name.trim().length > 1 && phoneOk && emailOk;

  // login สำเร็จ (มี token+user จริง หรือ mock) → ตั้ง state + redirect ตาม role
  const finishWithUser = (token: string, user: AuthUser) => {
    login(token, user);
    const target = redirect ?? (user.role === "AFFILIATE" ? "/affiliate" : "/tickets");
    closeLogin();
    navigate(target);
  };

  // mock: สร้าง user ปลอม (role ตาม affiliate account ที่สมัครไว้ในเครื่อง)
  const finishMock = (u: { name: string; email: string; phone?: string }) => {
    const isAffiliate = useAffiliateAccountStore.getState().registered;
    finishWithUser("demo-token", { id: "u-demo", name: u.name, email: u.email, phone: u.phone, role: isAffiliate ? "AFFILIATE" : "CUSTOMER" });
  };

  const run = async (fn: () => Promise<AuthResult>, fallbackMsg: string) => {
    if (busy) return;
    setBusy(true); setErr("");
    try { const { token, user } = await fn(); finishWithUser(token, user); }
    catch (e) { setErr((e as { message?: string })?.message ?? fallbackMsg); }
    finally { setBusy(false); }
  };

  // login ด้วย OTP — ขอ OTP แล้วไปขั้นกรอกรหัส
  const requestOtpAndGo = async () => {
    if (!phoneOk) return;
    if (!USE_MOCK) { try { await api.auth.requestOtp(phone.trim()); } catch { /* demo: ไม่บล็อกถ้า request fail */ } }
    setStep("otp"); setOtp(""); setErr("");
  };

  const submitOtp = () => {
    if (!otpOk) return;
    if (USE_MOCK) return finishMock({ name: name.trim() || "คุณลูกค้า", email: `${phone}@eventx.demo`, phone });
    void run(() => api.auth.verifyOtp(phone.trim(), otp.trim()), t("login.loginFailed"));
  };

  const submitRegister = () => {
    if (!regOk) { setTouched(true); return; }
    if (USE_MOCK) return finishMock({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    void run(() => api.auth.register({ name: name.trim(), phone: phone.trim(), email: email.trim() }), t("login.registerFailed"));
  };

  const submitSocial = (provider: string, dName: string, dEmail: string) => {
    if (USE_MOCK) return finishMock({ name: dName, email: dEmail });
    void run(() => api.auth.social({ provider, name: dName, email: dEmail }), t("login.loginFailed"));
  };

  const input = "h-12 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-ink outline-none transition-colors focus:border-brand focus:ring-[3px] focus:ring-brand/10 placeholder:text-muted";
  const label = "mb-1.5 block text-[13px] font-medium text-ink";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={closeLogin} aria-hidden="true" />

      <div role="dialog" aria-modal="true" aria-label={t("login.title")} className="ecn-rise relative z-10 w-full max-w-sm rounded-2xl bg-white p-7 shadow-e3" style={{ animationDuration: "0.18s" }}>
        <button onClick={closeLogin} aria-label="ปิด" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div className="text-center">
          <span className="font-display text-3xl font-bold tracking-tight text-brand-gradient">EventX</span>
          <p className="-mt-1 text-[13px] font-medium tracking-widest text-muted">TICKET</p>
        </div>

        {/* ── OTP step ── */}
        {step === "otp" ? (
          <div className="mt-6">
            <h2 className="text-center text-xl font-semibold text-ink">{t("login.otpTitle")}</h2>
            <p className="mt-1 text-center text-[13px] text-slate">{t("login.otpSentTo")} +66{phone.replace(/^0/, "")}</p>
            <input
              type="tel" inputMode="numeric" autoFocus maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={`${input} mt-5 text-center text-2xl tracking-[0.4em]`}
            />
            <p className="mt-2 text-center text-[12px] text-muted">{t("login.otpHint")}</p>
            {err && <p role="alert" className="mt-3 text-center text-[12px] text-error">{err}</p>}
            <button
              onClick={submitOtp}
              disabled={!otpOk || busy}
              className="mt-4 w-full rounded-full bg-brand-gradient py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t("login.pleaseWait") : t("login.verify")}
            </button>
            <div className="mt-3 flex items-center justify-between text-[12px]">
              <button onClick={() => { setStep("form"); setOtp(""); }} className="text-slate hover:text-ink">{t("login.back")}</button>
              <button onClick={() => setOtp("")} className="text-brand hover:underline">{t("login.resend")}</button>
            </div>
          </div>
        ) : (
          <>
            {/* ── tabs ── */}
            <div className="mt-5 flex rounded-full bg-surface p-1 text-[14px] font-medium">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setTouched(false); }}
                  className={`flex-1 rounded-full py-2 transition-colors ${mode === m ? "bg-white text-brand shadow-e1" : "text-slate hover:text-ink"}`}
                >
                  {t(m === "login" ? "login.tabLogin" : "login.tabRegister")}
                </button>
              ))}
            </div>

            {mode === "register" && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className={label} htmlFor="r-name">{t("login.name")}</label>
                  <input id="r-name" className={input} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className={label} htmlFor="r-email">{t("login.emailLabel")}</label>
                  <input id="r-email" type="email" inputMode="email" placeholder="you@example.com" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className={label} htmlFor="r-phone">{t("login.phone")}</label>
                  <input id="r-phone" type="tel" inputMode="tel" maxLength={10} placeholder="08xxxxxxxx" className={input} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
                </div>
                {touched && !regOk && <p role="alert" className="text-[12px] text-error">{t("login.regValidation")}</p>}
                {err && <p role="alert" className="text-[12px] text-error">{err}</p>}
                <button
                  onClick={submitRegister}
                  disabled={busy}
                  className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                >
                  {busy ? t("login.pleaseWait") : t("login.regBtn")}
                </button>
              </div>
            )}

            {mode === "login" && (
              <div className="mt-5">
                <label className={label} htmlFor="l-phone">{t("login.phone")}</label>
                <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/10">
                  <span className="text-[15px] font-medium text-ink">+66</span>
                  <input
                    id="l-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={10}
                    placeholder={t("login.phone")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
                  />
                </div>
                {err && <p role="alert" className="mt-3 text-[12px] text-error">{err}</p>}
                <button
                  onClick={requestOtpAndGo}
                  disabled={!phoneOk}
                  className="mt-4 w-full rounded-full bg-brand-gradient py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("login.otp")}
                </button>
              </div>
            )}

            {/* ── social ── */}
            <div className="my-5 flex items-center gap-3 text-[12px] text-muted">
              <span className="h-px flex-1 border-t border-dashed border-line" /> {t("login.or")} <span className="h-px flex-1 border-t border-dashed border-line" />
            </div>
            <button onClick={() => submitSocial("google", "ผู้ใช้ Google", "demo@gmail.com")} disabled={busy} className="mb-3 flex w-full items-center justify-center gap-3 rounded-full border border-line py-3 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.8Z" /><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23Z" /><path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2a11 11 0 0 0 0 9.8l3.7-2.8Z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2 7.1l3.7 2.8C6.6 7.4 9.1 5.4 12 5.4Z" /></svg>
              {t("login.google")}
            </button>
            <button onClick={() => submitSocial("email", "ผู้ใช้อีเมล", "demo@example.com")} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-full border border-line py-3 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              {t("login.email")}
            </button>

            <p className="mt-5 text-center text-[12px] text-muted">{t("login.help")} <a href="#" className="text-brand hover:underline">{t("login.contact")}</a></p>
          </>
        )}
      </div>
    </div>
  );
}
