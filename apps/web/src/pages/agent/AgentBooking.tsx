import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AgentShell from "../../components/AgentShell";
import { EVENTS, formatTHB } from "../../data/events";
import { getEventDetail } from "../../data/eventDetail";
import { useAgentStore, AGENT } from "../../stores/agentStore";
import { useTicketsStore } from "../../stores/ticketsStore";
import { makeQr } from "../../lib/qr";

type TitlePrefix = "MR" | "MRS" | "MS";
const TITLES: { value: TitlePrefix; label: string }[] = [
  { value: "MR", label: "นาย" },
  { value: "MRS", label: "นาง" },
  { value: "MS", label: "นางสาว" },
];

interface IssuedTicket {
  ticketNo: string;
  qr: string;
  isAgentCopy: boolean;
}

export default function AgentBooking() {
  const { t } = useTranslation();
  const addBooking = useAgentStore((s) => s.addBooking);
  const addTickets = useTicketsStore((s) => s.addTickets);
  const bookable = EVENTS.filter((e) => e.status !== "SOLD_OUT");

  const [slug, setSlug] = useState("");
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ title: "" as "" | TitlePrefix, firstName: "", lastName: "", phone: "", email: "" });
  const [issuing, setIssuing] = useState(false);
  const [done, setDone] = useState<{ bookingNo: string; tickets: IssuedTicket[]; eventTitle: string; eventImage?: string } | null>(null);

  const detail = useMemo(() => (slug ? getEventDetail(slug) : undefined), [slug]);
  const tt = detail?.ticketTypes.find((t) => t.id === ticketTypeId);
  const session = detail?.sessions.find((s) => s.id === sessionId);
  const amount = (tt?.price ?? 0) * qty;

  const valid =
    detail &&
    tt &&
    session &&
    qty > 0 &&
    form.title &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    /^0\d{8,9}$/.test(form.phone.trim()) &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim());

  const onSelectEvent = (s: string) => {
    setSlug(s);
    const d = getEventDetail(s);
    setTicketTypeId(d?.ticketTypes[0]?.id ?? "");
    setSessionId(d?.sessions[0]?.id ?? "");
    setQty(1);
  };

  const issue = async () => {
    if (!valid || issuing || !detail || !tt) return;
    setIssuing(true);
    try {
      const bookingNo = `AGT-2026-${String(Math.floor(Date.now() % 1000000)).padStart(6, "0")}`;
      const tickets: IssuedTicket[] = [];
      // ตั๋วจริงให้ลูกค้า
      for (let i = 0; i < qty; i++) {
        const ticketNo = `${bookingNo}-${String(i + 1).padStart(2, "0")}`;
        const qr = await makeQr(JSON.stringify({ bookingNo, ticketNo, event: detail.title, holder: `${form.firstName} ${form.lastName}` }));
        tickets.push({ ticketNo, qr, isAgentCopy: false });
      }
      // สำเนาให้ agent
      const copyNo = `${bookingNo}-COPY`;
      const copyQr = await makeQr(JSON.stringify({ bookingNo, ticketNo: copyNo, agent: AGENT.code, copy: true }));
      tickets.push({ ticketNo: copyNo, qr: copyQr, isAgentCopy: true });

      addBooking({
        id: bookingNo,
        bookingNo,
        eventTitle: detail.title,
        ticketName: tt.name,
        sessionLabel: session?.dateLabel,
        qty,
        amount,
        customerName: `${form.firstName} ${form.lastName}`,
        customerEmail: form.email,
        createdAt: Date.now(),
      });
      // บันทึกบัตรลูกค้า (ไม่รวมสำเนา agent) ลง ticketsStore เพื่อให้สแกนเช็คอินได้
      addTickets(
        tickets
          .filter((t) => !t.isAgentCopy)
          .map((t) => ({
            id: t.ticketNo,
            ticketNo: t.ticketNo,
            orderNo: bookingNo,
            eventTitle: detail.title,
            eventImage: detail.image,
            ticketName: tt.name,
            sessionLabel: session?.dateLabel,
            qr: t.qr,
            status: "ISSUED" as const,
            purchasedAt: Date.now(),
          }))
      );
      setDone({ bookingNo, tickets, eventTitle: detail.title, eventImage: detail.image });
    } finally {
      setIssuing(false);
    }
  };

  const input = "h-10 w-full rounded-md border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10";
  const label = "mb-1 block text-[13px] font-medium text-ink";

  // ── หน้าออกบัตรสำเร็จ ─────────────────────────────
  if (done) {
    const customerTickets = done.tickets.filter((t) => !t.isAgentCopy);
    const agentCopy = done.tickets.find((t) => t.isAgentCopy);
    return (
      <AgentShell>
        <div className="mx-auto max-w-lg">
          <div className="rounded-xl border border-line bg-white p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-3xl text-success">✓</div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-semibold text-ink">{t("agent.successTitle")}</h1>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">COMPLETED</span>
            </div>
            <p className="mt-1 text-[14px] text-slate">{t("agent.successSub")} {form.email} {t("agent.andCopy")} · {done.bookingNo}</p>
          </div>

          <p className="mt-5 mb-2 text-[13px] font-medium text-slate">{t("agent.custTickets")} ({customerTickets.length})</p>
          <div className="space-y-3">
            {customerTickets.map((t) => (
              <div key={t.ticketNo} className="flex items-center gap-4 rounded-xl border border-line bg-white p-4">
                {done.eventImage ? (
                  <img src={done.eventImage} alt={done.eventTitle} className="h-16 w-16 shrink-0 rounded-md border border-line object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-xl text-white">🎟️</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{done.eventTitle}</p>
                  <p className="font-mono text-[11px] text-muted">{t.ticketNo}</p>
                </div>
                <img src={t.qr} alt={t.ticketNo} className="h-16 w-16 shrink-0 rounded-md border border-line" />
              </div>
            ))}
          </div>

          {agentCopy && (
            <>
              <p className="mt-5 mb-2 text-[13px] font-medium text-slate">{t("agent.agentCopy")}</p>
              <div className="flex items-center gap-4 rounded-xl border border-brand/30 bg-brand/5 p-4">
                <img src={agentCopy.qr} alt={agentCopy.ticketNo} className="h-20 w-20 rounded-md border border-line bg-white" />
                <div>
                  <p className="font-semibold text-ink">{t("agent.agentCopyName")}</p>
                  <p className="font-mono text-[11px] text-muted">{agentCopy.ticketNo}</p>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 flex gap-3">
            <button onClick={() => { setDone(null); setSlug(""); setForm({ title: "", firstName: "", lastName: "", phone: "", email: "" }); }} className="flex-1 rounded-md bg-brand py-3 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-[0.98]">
              {t("agent.issueNew")}
            </button>
            <Link to="/agent" className="flex-1 rounded-md border border-line py-3 text-center text-sm text-slate hover:bg-surface">{t("agent.toDash")}</Link>
          </div>
        </div>
      </AgentShell>
    );
  }

  // ── ฟอร์มสร้างการจอง ─────────────────────────────
  return (
    <AgentShell>
      <h1 className="text-2xl font-semibold text-ink">{t("agent.bookTitle")}</h1>
      <p className="mt-1 text-[14px] text-slate">{t("agent.bookSub")}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* เลือกอีเวนต์ */}
          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="mb-3 text-base font-semibold text-ink">{t("agent.step1")}</h2>
            <select value={slug} onChange={(e) => onSelectEvent(e.target.value)} className={input}>
              <option value="">{t("agent.selectEvent")}</option>
              {bookable.map((e) => (
                <option key={e.id} value={e.slug}>{e.title} · {e.province}</option>
              ))}
            </select>
          </section>

          {/* เลือกบัตร */}
          {detail && (
            <section className="rounded-xl border border-line bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-ink">{t("agent.step2")}</h2>
              <label className={label}>{t("agent.session")}</label>
              <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className={`${input} mb-4`}>
                {detail.sessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label} · {s.dateLabel}</option>
                ))}
              </select>
              <label className={label}>{t("agent.ticketType")}</label>
              <div className="space-y-2">
                {detail.ticketTypes.map((tkt) => (
                  <button
                    key={tkt.id}
                    onClick={() => setTicketTypeId(tkt.id)}
                    className={`flex w-full items-center justify-between rounded-md border px-4 py-2.5 text-left text-sm transition-colors ${tkt.id === ticketTypeId ? "border-brand bg-brand/5" : "border-line hover:border-brand/40"}`}
                  >
                    <span className="text-ink">{tkt.name}</span>
                    <span className="font-medium text-brand">{formatTHB(tkt.price)}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className={label + " mb-0"}>{t("agent.qty")}</span>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-lg text-ink active:scale-90">−</button>
                <span className="w-8 text-center font-medium tabular-nums text-ink">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-lg text-ink active:scale-90">+</button>
              </div>
            </section>
          )}

          {/* ข้อมูลลูกค้า */}
          {detail && (
            <section className="rounded-xl border border-line bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-ink">{t("agent.step3")}</h2>
              <label className={label}>{t("checkout.title")}</label>
              <div className="mb-4 flex gap-2">
                {TITLES.map((ti) => (
                  <button key={ti.value} onClick={() => setForm((f) => ({ ...f, title: ti.value }))} className={`rounded-md border px-4 py-2 text-sm transition-colors ${form.title === ti.value ? "border-brand bg-brand/5 text-ink" : "border-line text-slate hover:border-brand/40"}`}>{t(`checkout.${ti.value.toLowerCase()}`)}</button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={label}>{t("checkout.first")}</label><input className={input} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} /></div>
                <div><label className={label}>{t("checkout.last")}</label><input className={input} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} /></div>
                <div><label className={label}>{t("checkout.phone")}</label><input type="tel" inputMode="tel" maxLength={10} className={input} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))} /></div>
                <div><label className={label}>{t("checkout.email")}</label><input type="email" inputMode="email" className={input} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
              </div>
            </section>
          )}
        </div>

        {/* สรุป */}
        <aside className="h-fit rounded-xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <h3 className="text-base font-semibold text-ink">{t("agent.summary")}</h3>
          <dl className="mt-4 space-y-2 text-[14px]">
            <div className="flex justify-between"><dt className="text-slate">{t("agent.agentLabel")}</dt><dd className="text-ink">{AGENT.code}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">{t("agent.eventLabel")}</dt><dd className="max-w-[60%] truncate text-right text-ink">{detail?.title ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">{t("agent.ticketLabel")}</dt><dd className="text-ink">{tt ? `${tt.name} × ${qty}` : "—"}</dd></div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-[13px] text-slate">{t("agent.receiveAmt")}</span>
            <span className="text-xl font-semibold text-ink">{formatTHB(amount)}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">{t("agent.cashNote")}</p>
          <button
            onClick={issue}
            disabled={!valid || issuing}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3.5 text-sm font-medium text-white shadow-brand transition-all hover:bg-brand-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {issuing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {issuing ? t("agent.issuing") : t("agent.issue")}
          </button>
        </aside>
      </div>
    </AgentShell>
  );
}
