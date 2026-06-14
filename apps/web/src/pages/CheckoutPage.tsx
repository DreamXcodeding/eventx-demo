import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CnxNav from "../components/CnxNav";
import CnxFooter from "../components/CnxFooter";
import { formatTHB } from "../data/events";
import { useCartStore } from "../stores/cartStore";
import { useAffiliateStore } from "../stores/affiliateStore";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";
import { useTicketsStore } from "../stores/ticketsStore";
import { makeQr } from "../lib/qr";

type Step = "form" | "pay" | "success" | "expired";
type OrderStatus = "PENDING" | "PAID" | "COMPLETED" | "EXPIRED";
type TitlePrefix = "MR" | "MRS" | "MS";

const HOLD_MS = 15 * 60 * 1000; // hold 15 นาที (ECN-Technical-Design Part 2)
const mmss = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const TITLES: { value: TitlePrefix; label: string }[] = [
  { value: "MR", label: "นาย" },
  { value: "MRS", label: "นาง" },
  { value: "MS", label: "นางสาว" },
];

interface IssuedTicket {
  ticketNo: string;
  eventTitle: string;
  eventImage?: string;
  ticketName: string;
  sessionLabel?: string;
  qr: string;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const count = useCartStore((s) => s.count());
  const clear = useCartStore((s) => s.clear);
  const affiliate = useAffiliateStore((s) => s.code);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const openLogin = useUiStore((s) => s.openLogin);
  const addTickets = useTicketsStore((s) => s.addTickets);

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ title: "" as "" | TitlePrefix, firstName: "", lastName: "", phone: "", email: "" });
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("PENDING");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [payQr, setPayQr] = useState("");
  const [tickets, setTickets] = useState<IssuedTicket[]>([]);
  const [paying, setPaying] = useState(false);

  const remaining = expiresAt ? expiresAt - now : 0;

  const valid = useMemo(
    () =>
      form.title &&
      form.firstName.trim() &&
      form.lastName.trim() &&
      /^0\d{8,9}$/.test(form.phone.trim()) &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()) &&
      consent,
    [form, consent]
  );

  // เข้าขั้นชำระเงิน → สร้าง order สถานะ PENDING + hold 15 นาที (ตัด inventory ตอนนี้)
  useEffect(() => {
    if (step !== "pay" || expiresAt) return;
    const no = `EVX-2026-${String(Math.floor(Date.now() % 1000000)).padStart(6, "0")}`;
    setOrderNo(no);
    setOrderStatus("PENDING");
    setExpiresAt(Date.now() + HOLD_MS);
    makeQr(`promptpay://demo?order=${no}&amount=${subtotal}`).then(setPayQr);
  }, [step, subtotal, expiresAt]);

  // นับถอยหลัง hold → หมดเวลา = EXPIRED (คืน inventory)
  useEffect(() => {
    if (step !== "pay" || !expiresAt) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= expiresAt) {
        setOrderStatus("EXPIRED");
        setStep("expired");
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [step, expiresAt]);

  // เริ่มจองรอบใหม่ (ปล่อย hold เดิม) — cart ยังอยู่
  const restartHold = () => {
    setExpiresAt(null);
    setPayQr("");
    setOrderStatus("PENDING");
    setStep("form");
  };

  // เข้าหน้า checkout ตรง ๆ ตอนยังไม่ login → เปิด modal เข้าสู่ระบบ
  useEffect(() => {
    if (!isAuthenticated) openLogin("/checkout");
  }, [isAuthenticated, openLogin]);

  // เติมข้อมูลจากบัญชีที่ล็อกอิน (ผู้ซื้อแก้ไขได้)
  useEffect(() => {
    if (!user) return;
    const [first, ...rest] = (user.name ?? "").split(" ");
    setForm((f) => ({
      ...f,
      firstName: f.firstName || first || "",
      lastName: f.lastName || rest.join(" "),
      phone: f.phone || user.phone || "",
      email: f.email || (user.email?.includes("@ecn.demo") ? "" : user.email) || "",
    }));
  }, [user]);

  const confirmPayment = async () => {
    if (paying || remaining <= 0) return; // หมดเวลา hold แล้วจ่ายไม่ได้
    setPaying(true);
    setOrderStatus("PAID"); // payment สำเร็จ → order.PAID
    try {
      const issued: IssuedTicket[] = [];
      let n = 1;
      for (const it of items) {
        for (let i = 0; i < it.quantity; i++) {
          const ticketNo = `${orderNo}-${String(n).padStart(2, "0")}`;
          const qr = await makeQr(JSON.stringify({ orderNo, ticketNo, event: it.eventTitle, type: it.ticketName }));
          issued.push({ ticketNo, eventTitle: it.eventTitle, eventImage: it.eventImage, ticketName: it.ticketName, sessionLabel: it.sessionLabel, qr });
          n++;
        }
      }
      setTickets(issued);
      // เก็บลง My Tickets (persist)
      addTickets(
        issued.map((t) => ({
          id: t.ticketNo,
          ticketNo: t.ticketNo,
          orderNo,
          eventTitle: t.eventTitle,
          eventImage: t.eventImage,
          ticketName: t.ticketName,
          sessionLabel: t.sessionLabel,
          qr: t.qr,
          status: "ISSUED" as const,
          purchasedAt: Date.now(),
        }))
      );
      setOrderStatus("COMPLETED"); // ออกบัตรครบ → COMPLETED
      setStep("success");
      clear();
    } finally {
      setPaying(false);
    }
  };

  const empty = items.length === 0 && step === "form";

  const input = "h-10 w-full rounded-md border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10";
  const label = "mb-1 block text-[13px] font-medium text-ink";

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <CnxNav variant="light" />

      <div className="mx-auto max-w-[1000px] px-6 py-10">
        {/* stepper */}
        <ol className="mb-8 flex items-center justify-center gap-3 text-[13px]">
          {[
            { k: "form", label: t("checkout.stepInfo") },
            { k: "pay", label: t("checkout.stepPay") },
            { k: "success", label: t("checkout.stepReceive") },
          ].map((s, i) => {
            const order = { form: 0, pay: 1, expired: 1, success: 2 }[step];
            const on = i <= order;
            return (
              <li key={s.k} className="flex items-center gap-2 sm:gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${on ? "bg-brand text-white" : "bg-line text-muted"}`}>{i + 1}</span>
                <span className={`whitespace-nowrap ${on ? "text-ink" : "text-muted"} ${i === order ? "inline" : "hidden sm:inline"}`}>{s.label}</span>
                {i < 2 && <span className="h-px w-5 bg-line sm:w-8" />}
              </li>
            );
          })}
        </ol>

        {empty && (
          <div className="rounded-xl border border-line bg-white p-12 text-center">
            <p className="text-ink">{t("checkout.emptyCart")}</p>
            <Link to="/" className="mt-4 inline-block rounded-md bg-brand px-5 py-2 text-sm font-medium text-white">{t("checkout.chooseEvent")}</Link>
          </div>
        )}

        {/* STEP 1: form */}
        {step === "form" && !empty && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl border border-line bg-white p-6">
              <h2 className="text-xl font-semibold text-ink">{t("checkout.formTitle")}</h2>
              <p className="mt-1 text-[13px] text-slate">{t("checkout.formSub")}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className={label}>{t("checkout.title")}</label>
                  <div className="flex gap-2">
                    {TITLES.map((tt) => (
                      <button
                        key={tt.value}
                        onClick={() => setForm((f) => ({ ...f, title: tt.value }))}
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${form.title === tt.value ? "border-brand bg-brand/5 text-ink" : "border-line text-slate hover:border-brand/40"}`}
                      >
                        {t(`checkout.${tt.value.toLowerCase()}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="f-first">{t("checkout.first")} <span className="text-error">*</span></label>
                    <input id="f-first" autoComplete="given-name" className={input} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className={label} htmlFor="f-last">{t("checkout.last")} <span className="text-error">*</span></label>
                    <input id="f-last" autoComplete="family-name" className={input} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="f-phone">{t("checkout.phone")} <span className="text-error">*</span></label>
                    <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={10} className={input} placeholder="08xxxxxxxx" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} />
                  </div>
                  <div>
                    <label className={label} htmlFor="f-email">{t("checkout.email")} <span className="text-error">*</span></label>
                    <input id="f-email" type="email" inputMode="email" autoComplete="email" className={input} placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-2 text-[13px] text-slate">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand" />
                  <span>{t("checkout.consent")} <a href="#" className="text-brand hover:underline">{t("checkout.privacy")}</a> {t("checkout.consentTail")}</span>
                </label>
                {touched && !valid && (
                  <p role="alert" className="text-[12px] text-error">{t("checkout.validation")}</p>
                )}
              </div>
            </div>

            <OrderSummary items={items} subtotal={subtotal} count={count} affiliate={affiliate}>
              <button
                onClick={() => (valid ? setStep("pay") : setTouched(true))}
                className={`w-full rounded-md py-3.5 text-sm font-medium text-white transition-all active:scale-[0.98] ${valid ? "bg-brand hover:bg-brand-hover" : "bg-brand/50"}`}
              >
                {t("checkout.proceedPay")}
              </button>
            </OrderSummary>
          </div>
        )}

        {/* STEP 2: pay (mock PromptPay) */}
        {step === "pay" && (
          <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-8 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <h2 className="text-xl font-semibold text-ink">{t("checkout.payTitle")}</h2>
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-[#8a6500]">{orderStatus}</span>
            </div>
            <p className="text-[13px] text-slate">PromptPay · {t("checkout.order")} {orderNo}</p>

            {/* countdown hold 15 นาที */}
            <div className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium tabular-nums ${remaining <= 120000 ? "border-error/40 bg-error/5 text-error" : "border-line bg-surface text-ink"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              {t("checkout.payWithin")} {mmss(remaining)}
            </div>

            {payQr ? <img src={payQr} alt="PromptPay QR" className="mx-auto my-6 h-56 w-56 rounded-lg border border-line" /> : <div className="mx-auto my-6 h-56 w-56 animate-pulse rounded-lg bg-surface" />}
            <p className="text-2xl font-semibold text-ink">{formatTHB(subtotal)}</p>
            <p className="mt-1 text-[12px] text-muted">{t("checkout.demoNote")}</p>
            <button onClick={confirmPayment} disabled={paying || remaining <= 0} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-success py-3.5 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70">
              {paying && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {paying ? t("checkout.issuing") : t("checkout.paySuccess")}
            </button>
            <button onClick={restartHold} className="mt-2 w-full rounded-md border border-line py-2.5 text-sm text-slate hover:bg-surface">{t("checkout.back")}</button>
            <p className="mt-3 text-[11px] text-muted">{t("checkout.holdNote")}</p>
          </div>
        )}

        {/* STEP 2b: expired (hold timeout → คืน inventory) */}
        {step === "expired" && (
          <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-3xl text-error">⏱</div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-semibold text-ink">{t("checkout.expiredTitle")}</h2>
              <span className="rounded-full bg-error/15 px-2 py-0.5 text-[11px] font-medium text-error">EXPIRED</span>
            </div>
            <p className="mt-2 text-[14px] text-slate">{t("checkout.order")} {orderNo} · {t("checkout.expiredBody")}</p>
            <button onClick={restartHold} className="mt-6 w-full rounded-md bg-brand py-3.5 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-[0.98]">{t("checkout.restart")}</button>
            <Link to="/" className="mt-2 block w-full rounded-md border border-line py-2.5 text-sm text-slate hover:bg-surface">{t("checkout.home")}</Link>
          </div>
        )}

        {/* STEP 3: success */}
        {step === "success" && (
          <div className="mx-auto max-w-lg">
            <div className="rounded-xl border border-line bg-white p-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-3xl text-success">✓</div>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-semibold text-ink">{t("checkout.successTitle")}</h2>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">{orderStatus}</span>
              </div>
              <p className="mt-1 text-[14px] text-slate">{t("checkout.successBody")} {form.email} · {t("checkout.order")} {orderNo}</p>
            </div>

            <div className="mt-5 space-y-4">
              {tickets.map((t) => (
                <div key={t.ticketNo} className="flex items-center gap-4 overflow-hidden rounded-xl border border-line bg-white p-4">
                  {t.eventImage ? (
                    <img src={t.eventImage} alt={t.eventTitle} className="h-20 w-20 shrink-0 rounded-md border border-line object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-2xl text-white">🎟️</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{t.eventTitle}</p>
                    <p className="text-[13px] text-brand">{t.ticketName}</p>
                    {t.sessionLabel && <p className="text-[12px] text-slate">{t.sessionLabel}</p>}
                    <p className="mt-1 font-mono text-[11px] text-muted">{t.ticketNo}</p>
                  </div>
                  <img src={t.qr} alt={t.ticketNo} className="h-20 w-20 shrink-0 rounded-md border border-line" />
                </div>
              ))}
            </div>

            <Link to="/" className="mt-6 block w-full rounded-md bg-brand py-3 text-center text-sm font-medium text-white">{t("checkout.home")}</Link>
          </div>
        )}
      </div>

      <CnxFooter />
    </div>
  );
}

function OrderSummary({
  items,
  subtotal,
  count,
  affiliate,
  children,
}: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: number;
  count: number;
  affiliate: string | null;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <aside className="h-fit rounded-xl border border-line bg-white p-5 lg:sticky lg:top-24">
      <h3 className="text-lg font-semibold text-ink">{t("checkout.summary")}</h3>
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <div key={it.ticketTypeId} className="flex justify-between text-[14px]">
            <div>
              <p className="text-ink">{it.eventTitle}</p>
              <p className="text-[12px] text-slate">{it.ticketName} × {it.quantity}{it.sessionLabel ? ` · ${it.sessionLabel}` : ""}</p>
            </div>
            <span className="font-medium text-ink">{formatTHB(it.unitPrice * it.quantity)}</span>
          </div>
        ))}
      </div>
      {affiliate && <p className="mt-3 rounded-md bg-brand/5 px-3 py-2 text-[12px] text-brand">{t("checkout.via")}: {affiliate}</p>}
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-[13px] text-slate">{t("checkout.total")} ({count} {t("checkout.unit")})</span>
        <span className="text-xl font-semibold text-ink">{formatTHB(subtotal)}</span>
      </div>
      <div className="mt-4">{children}</div>
    </aside>
  );
}
