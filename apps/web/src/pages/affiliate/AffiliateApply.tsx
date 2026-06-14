import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AffiliateShell from "../../components/AffiliateShell";
import { useAffiliateAccountStore } from "../../stores/affiliateAccountStore";
import { useAuthStore } from "../../stores/authStore";
import { useUiStore } from "../../stores/uiStore";
import { api } from "../../lib/api";
import { USE_MOCK } from "../../lib/http";

export default function AffiliateApply() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useAffiliateAccountStore((s) => s.register);
  const login = useAuthStore((s) => s.login);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const openLogin = useUiStore((s) => s.openLogin);
  const [f, setF] = useState({ name: "", email: "", phone: "", channel: "" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const valid =
    f.name.trim() &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()) &&
    /^0\d{8,9}$/.test(f.phone.trim()) &&
    f.channel.trim();

  const submit = async () => {
    if (!valid) return setTouched(true);
    const profile = { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), channel: f.channel.trim() };
    if (USE_MOCK) {
      register(profile);
      login("demo-token", { id: "u-aff", name: profile.name, email: profile.email, phone: profile.phone, role: "AFFILIATE" });
      navigate("/affiliate");
      return;
    }
    // real: ต้องล็อกอินก่อน (apply ผูกกับ user ปัจจุบัน) แล้วเรียก API
    if (!isAuth) { openLogin("/affiliate/apply"); return; }
    setBusy(true); setErr("");
    try {
      const r = await api.affiliate.apply(profile);
      register(profile);
      login(r.token, r.user);
      navigate("/affiliate");
    } catch (e) {
      setErr((e as { message?: string })?.message ?? "สมัครไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const input = "h-10 w-full rounded-md border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10";
  const label = "mb-1 block text-[13px] font-medium text-ink";

  return (
    <AffiliateShell>
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold text-ink">{t("aff.applyTitle")}</h1>
        <p className="mt-1 text-[14px] text-slate">{t("aff.applySub")}</p>

        <div className="mt-6 rounded-xl border border-line bg-white p-6">
          <div className="space-y-4">
            <div>
              <label className={label} htmlFor="a-name">{t("aff.fName")}</label>
              <input id="a-name" className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="a-email">{t("aff.fEmail")}</label>
                <input id="a-email" type="email" inputMode="email" className={input} placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              </div>
              <div>
                <label className={label} htmlFor="a-phone">{t("aff.fPhone")}</label>
                <input id="a-phone" type="tel" inputMode="tel" maxLength={10} className={input} placeholder="08xxxxxxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} />
              </div>
            </div>
            <div>
              <label className={label} htmlFor="a-channel">{t("aff.fChannel")}</label>
              <input id="a-channel" className={input} placeholder={t("aff.channelPh")} value={f.channel} onChange={(e) => setF({ ...f, channel: e.target.value })} />
            </div>
            {touched && !valid && <p role="alert" className="text-[12px] text-error">{t("aff.applyValidation")}</p>}
            {err && <p role="alert" className="text-[12px] text-error">{err}</p>}
            <button onClick={submit} disabled={busy} className="w-full rounded-md bg-brand py-3.5 text-sm font-medium text-white shadow-brand transition-all hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50">
              {busy ? t("login.pleaseWait") : t("aff.applyBtn")}
            </button>
            <p className="text-center text-[12px] text-muted">{t("aff.applyFree")}</p>
          </div>
        </div>
      </div>
    </AffiliateShell>
  );
}
