import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatTHB } from "../data/events";
import type { EventDetail } from "../data/eventDetail";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";

export default function TicketPicker({ ev }: { ev: EventDetail }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clear = useCartStore((s) => s.clear);
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openLogin = useUiStore((s) => s.openLogin);

  const [sessionId, setSessionId] = useState(ev.sessions[0]?.id ?? "");
  // ตั้งต้นเลือกบัตรใบแรก 1 ใบ (ตาม Figma — total โชว์ทันที)
  const [qty, setQty] = useState<Record<string, number>>(() => (ev.ticketTypes[0] ? { [ev.ticketTypes[0].id]: 1 } : {}));
  const soldOut = ev.status === "SOLD_OUT";

  const setQ = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(10, (q[id] ?? 0) + d)) }));

  const total = useMemo(
    () => ev.ticketTypes.reduce((sum, t) => sum + (qty[t.id] ?? 0) * t.price, 0),
    [qty, ev.ticketTypes]
  );
  const count = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);
  const session = ev.sessions.find((s) => s.id === sessionId);

  const proceed = () => {
    if (count === 0) return;
    clear();
    ev.ticketTypes.forEach((t) => {
      const q = qty[t.id] ?? 0;
      if (q > 0)
        addItem({
          eventId: ev.id,
          eventSlug: ev.slug,
          eventTitle: ev.title,
          eventImage: ev.image,
          ticketTypeId: t.id,
          ticketName: t.name,
          sessionId: session?.id,
          sessionLabel: session?.dateLabel,
          unitPrice: t.price,
          quantity: q,
        });
    });
    if (isAuthenticated) navigate("/checkout");
    else openLogin("/checkout");
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-e2">
      <h3 className="text-lg font-semibold text-ink">{t("detail.pickTitle")}</h3>

      {/* เลือกรอบ/วันที่ */}
      {ev.sessions.length > 1 && (
        <div className="mt-4">
          <div className="grid gap-2">
            {ev.sessions.map((s) => {
              const on = s.id === sessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSessionId(s.id)}
                  className={`flex items-center justify-between gap-2.5 rounded-lg border px-4 py-3 text-left text-[14px] transition-colors ${
                    on ? "border-brand bg-brand-50" : "border-line hover:border-brand/40"
                  }`}
                >
                  <span className="font-semibold text-ink">{s.label}</span>
                  <span className="font-semibold text-ink">{s.dateLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* แพ็กบัตร */}
      <div className="mt-4 space-y-3">
        {ev.ticketTypes.map((tk) => (
          <div key={tk.id} className="rounded-xl border border-line p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
                  {tk.name}
                  {tk.badge && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand">{tk.badge}</span>}
                </p>
                <p className="mt-1 text-[24px] font-semibold text-brand">{formatTHB(tk.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQ(tk.id, -1)} disabled={soldOut} aria-label={`ลดจำนวน ${tk.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-xl text-ink transition-colors hover:border-brand/40 active:scale-90 disabled:opacity-40">−</button>
                <span className="w-7 text-center text-[24px] font-semibold tabular-nums text-ink" aria-live="polite">{qty[tk.id] ?? 0}</span>
                <button onClick={() => setQ(tk.id, 1)} disabled={soldOut} aria-label={`เพิ่มจำนวน ${tk.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-xl text-ink transition-colors hover:border-brand/40 active:scale-90 disabled:opacity-40">+</button>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {tk.perks.map((p) => (
                <li key={p} className="flex items-center gap-2 text-[14px] text-ink">
                  <svg className="h-4 w-4 shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* สรุป + CTA */}
      <div className="mt-4 border-t border-line pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[16px] text-ink">{t("detail.total")} ({count} {t("detail.unit")})</span>
          <span className="text-[24px] font-semibold text-ink">{formatTHB(total)}</span>
        </div>
        <button
          onClick={proceed}
          disabled={soldOut || count === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3.5 text-[16px] font-semibold text-white shadow-brand transition-all hover:bg-brand-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {count > 0 && !soldOut && (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M9 7v10" strokeDasharray="2 2" /></svg>
          )}
          {soldOut ? t("detail.soldOut") : count === 0 ? t("detail.pickAtLeast") : t("detail.buy")}
        </button>
      </div>
    </div>
  );
}
