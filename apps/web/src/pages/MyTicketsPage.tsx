import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CnxNav from "../components/CnxNav";
import CnxFooter from "../components/CnxFooter";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";
import { useTicketsStore, type MyTicket } from "../stores/ticketsStore";
import { api } from "../lib/api";
import { USE_MOCK } from "../lib/http";

const STATUS_CLS: Record<string, string> = {
  ISSUED: "bg-success/10 text-success",
  CHECKED_IN: "bg-muted/15 text-muted",
};

export default function MyTicketsPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openLogin = useUiStore((s) => s.openLogin);
  const storeTickets = useTicketsStore((s) => s.tickets);
  // real mode: ดึงจาก API · mock mode: ใช้ store (persist)
  const [apiTickets, setApiTickets] = useState<MyTicket[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    api.tickets.list()
      .then((list) => { if (!cancelled) setApiTickets(list); })
      .catch(() => { if (!cancelled) setApiTickets([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const tickets = USE_MOCK ? storeTickets : (apiTickets ?? []);

  // บันทึก QR (data:image) เป็นไฟล์ PNG
  const saveQr = (qr: string, ticketNo: string) => {
    const a = document.createElement("a");
    a.href = qr; a.download = `${ticketNo}.png`; a.click();
  };

  const eventCards = useMemo(() => {
    const grouped = new Map<string, { eventTitle: string; eventImage?: string; sessionLabel?: string; tickets: typeof tickets }>();

    for (const tk of tickets) {
      const key = `${tk.eventTitle}::${tk.sessionLabel ?? ""}`;
      const current = grouped.get(key);
      if (current) {
        current.tickets.push(tk);
      } else {
        grouped.set(key, { eventTitle: tk.eventTitle, eventImage: tk.eventImage, sessionLabel: tk.sessionLabel, tickets: [tk] });
      }
    }

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      tickets: [...group.tickets].sort((a, b) => b.purchasedAt - a.purchasedAt),
    }));
  }, [tickets]);

  useEffect(() => {
    if (!isAuthenticated) openLogin("/tickets");
  }, [isAuthenticated, openLogin]);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <CnxNav variant="light" />

      <main className="mx-auto max-w-[820px] px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink">{t("tickets.title")}</h1>
        <p className="mt-1 text-[14px] text-slate">{t("tickets.sub")}</p>

        {loading ? (
          <div className="mt-8 rounded-xl border border-line bg-white p-12 text-center text-slate">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
            {t("tickets.loading")}
          </div>
        ) : tickets.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-line bg-white p-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /></svg>
            </div>
            <p className="text-ink">{t("tickets.empty")}</p>
            <p className="mt-1 text-[13px] text-slate">{t("tickets.emptySub")}</p>
            <Link to="/" className="mt-4 inline-block rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-95">{t("tickets.choose")}</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {eventCards.map((eventCard) => {
              return (
                <section key={`${eventCard.eventTitle}-${eventCard.sessionLabel ?? ""}`} className="rounded-xl border border-line bg-white p-4 sm:p-5">
                  <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {eventCard.eventImage ? (
                        <img src={eventCard.eventImage} alt={eventCard.eventTitle} className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xl text-white">🎟️</div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-[17px] font-semibold leading-snug text-ink">{eventCard.eventTitle}</h3>
                        {eventCard.sessionLabel && <p className="mt-1 text-[13px] text-slate">{eventCard.sessionLabel}</p>}
                      </div>
                    </div>
                    <div className="text-[12px] text-muted sm:text-right">
                      <span>{eventCard.tickets.length} QR</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {eventCard.tickets.map((tk) => {
                      const cls = STATUS_CLS[tk.status] ?? STATUS_CLS.ISSUED;
                      const stLabel = tk.status === "CHECKED_IN" ? t("tickets.used") : t("tickets.ready");

                      return (
                        <article key={tk.id} className="flex items-center gap-4 rounded-lg border border-line bg-surface/60 p-3">
                          <img src={tk.qr} alt={`QR ${tk.ticketNo}`} className="h-24 w-24 shrink-0 rounded-lg border border-line bg-white sm:h-28 sm:w-28" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>{stLabel}</span>
                            </div>
                            <p className="mt-2 text-[13px] font-medium text-brand">{tk.ticketName}</p>
                            <p className="mt-1 break-all font-mono text-[11px] text-muted">{tk.ticketNo}</p>
                            <p className="mt-1 text-[11px] text-muted">{t("tickets.order")} {tk.orderNo}</p>
                            <button onClick={() => saveQr(tk.qr, tk.ticketNo)} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand-hover">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V3M7 10l5 5 5-5M5 21h14" /></svg>
                              {t("tickets.downloadPdf")}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
      <CnxFooter />
    </div>
  );
}
