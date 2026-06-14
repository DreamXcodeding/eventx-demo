import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrganizerShell from "../../components/OrganizerShell";
import DemoRoleGate from "../../components/DemoRoleGate";
import { ORG_EVENTS, revenueOf } from "../../data/organizer";
import { formatTHB } from "../../data/events";
import { api, type OrgEventDto } from "../../lib/api";
import { useApi } from "../../lib/useApi";

const MOCK_EVENTS: OrgEventDto[] = ORG_EVENTS.map((e) => ({ ...e, revenue: revenueOf(e) }));

export default function OrganizerEvents() {
  const { t } = useTranslation();
  const { data: events } = useApi(() => api.organizer.events(), MOCK_EVENTS);

  // export ยอดขายเป็น CSV (เปิดด้วย Excel ได้, BOM กันภาษาไทยเพี้ยน)
  const exportCsv = (e: typeof events[number]) => {
    const rows = [
      ["Event", "Date", "Price", "Quota", "Sold", "CheckedIn", "Revenue"],
      [e.title, e.dateLabel, e.price, e.quota, e.sold, e.checkedIn, e.revenue],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${e.slug}-sales.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DemoRoleGate role="ORGANIZER">
      <OrganizerShell>
        <h1 className="text-2xl font-semibold text-ink">{t("organizer.myEvents")}</h1>
        <p className="mt-1 text-[14px] text-slate">{t("organizer.evSub")}</p>

        <div className="mt-6 space-y-4">
          {events.map((e) => {
            const pct = e.quota ? Math.min(100, Math.round((e.sold / e.quota) * 100)) : 0;
            return (
              <div key={e.id} className="rounded-xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">{e.title}</h2>
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">{t("organizer.onSale")}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-slate">{e.dateLabel} · {formatTHB(e.price)} {t("organizer.perTicket")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-muted">{t("organizer.revenue")}</p>
                    <p className="text-xl font-semibold text-ink">{formatTHB(e.revenue)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[12px] text-slate">
                    <span>{t("organizer.soldOf")} {e.sold.toLocaleString("th-TH")} / {e.quota.toLocaleString("th-TH")}</span>
                    <span className="font-medium text-brand">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Link to="/checkin" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-95">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" /></svg>
                    {t("organizer.scan")}
                  </Link>
                  <Link to={`/events/${e.slug}`} className="rounded-md border border-line px-4 py-2 text-sm font-medium text-slate transition-colors hover:bg-surface">{t("organizer.viewPage")}</Link>
                  <button onClick={() => exportCsv(e)} className="rounded-md border border-line px-4 py-2 text-sm font-medium text-slate transition-colors hover:bg-surface">{t("organizer.exportExcel")}</button>
                </div>
              </div>
            );
          })}
        </div>
      </OrganizerShell>
    </DemoRoleGate>
  );
}
