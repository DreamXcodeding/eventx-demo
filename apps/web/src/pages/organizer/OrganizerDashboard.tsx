import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrganizerShell from "../../components/OrganizerShell";
import DemoRoleGate from "../../components/DemoRoleGate";
import { ORGANIZER, ORG_EVENTS, revenueOf } from "../../data/organizer";
import { formatTHB } from "../../data/events";
import { api, type OrgEventDto, type OrgDashboard } from "../../lib/api";
import { useApi } from "../../lib/useApi";

// mock → OrgEventDto (เพิ่ม revenue)
const MOCK_EVENTS: OrgEventDto[] = ORG_EVENTS.map((e) => ({ ...e, revenue: revenueOf(e) }));
const MOCK_DASH: OrgDashboard = {
  events: ORG_EVENTS.length,
  totalSold: ORG_EVENTS.reduce((n, e) => n + e.sold, 0),
  totalCheckedIn: ORG_EVENTS.reduce((n, e) => n + e.checkedIn, 0),
  revenue: ORG_EVENTS.reduce((n, e) => n + revenueOf(e), 0),
  feeBps: ORGANIZER.feeBps,
  fee: Math.floor((ORG_EVENTS.reduce((n, e) => n + revenueOf(e), 0) * ORGANIZER.feeBps) / 10000),
  net: 0,
};
MOCK_DASH.net = MOCK_DASH.revenue - MOCK_DASH.fee;

export default function OrganizerDashboard() {
  const { t } = useTranslation();
  const { data: events } = useApi(() => api.organizer.events(), MOCK_EVENTS);
  const { data: d } = useApi(() => api.organizer.dashboard(), MOCK_DASH);

  const stats = [
    { label: t("organizer.sGmv"), value: formatTHB(d.revenue) },
    { label: t("organizer.sSold"), value: d.totalSold.toLocaleString("th-TH"), hint: `${d.events} ${t("organizer.events_")}` },
    { label: `${t("organizer.sFee")} (${(d.feeBps / 100).toFixed(0)}%)`, value: `- ${formatTHB(d.fee)}`, danger: true },
    { label: t("organizer.sNet"), value: formatTHB(d.net), accent: true },
  ];

  return (
    <DemoRoleGate role="ORGANIZER">
      <OrganizerShell>
        <h1 className="text-2xl font-semibold text-ink">{t("organizer.dashTitle")}</h1>
        <p className="mt-1 text-[14px] text-slate">{t("organizer.dashSub")}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? "border-brand/30 bg-brand/5" : "border-line bg-white"}`}>
              <p className="text-[13px] text-muted">{s.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${s.danger ? "text-error" : s.accent ? "text-brand" : "text-ink"}`}>{s.value}</p>
              {s.hint && <p className="mt-0.5 text-[12px] text-slate">{s.hint}</p>}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{t("organizer.myEvents")}</h2>
          <Link to="/organizer/events" className="text-sm font-medium text-brand hover:text-brand-hover">{t("organizer.seeAll")} →</Link>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">{t("organizer.colEvent")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("organizer.colDate")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("organizer.colSold")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("organizer.colRevenue")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("organizer.colCheckin")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const pct = e.quota ? Math.round((e.sold / e.quota) * 100) : 0;
                return (
                  <tr key={e.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{e.title}</td>
                    <td className="hidden px-4 py-3 text-slate sm:table-cell">{e.dateLabel}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="tabular-nums text-ink">{e.sold.toLocaleString("th-TH")}/{e.quota.toLocaleString("th-TH")}</span>
                      <span className="ml-2 text-[12px] text-muted">{pct}%</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">{formatTHB(e.revenue)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate">{e.checkedIn.toLocaleString("th-TH")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Link to="/checkin" className="mt-4 inline-flex items-center gap-2 rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" /></svg>
          {t("organizer.openScan")}
        </Link>
      </OrganizerShell>
    </DemoRoleGate>
  );
}
