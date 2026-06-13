import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminShell from "../../components/AdminShell";
import { useAdminStore } from "../../stores/adminStore";
import { EVENTS, formatTHB } from "../../data/events";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const organizers = useAdminStore((s) => s.organizers);
  const events = useAdminStore((s) => s.events);

  const totalEvents = EVENTS.length + events.length;
  const partners = organizers.filter((o) => o.status === "APPROVED").length;
  const pending = organizers.filter((o) => o.status === "DISCUSSING").length;
  const gmv = EVENTS.reduce((n, e) => n + e.priceFrom * 50, 0); // mock GMV ประมาณการ

  const stats = [
    { label: t("admin.sGmv"), value: formatTHB(gmv) },
    { label: t("admin.sEvents"), value: totalEvents.toLocaleString("th-TH"), hint: `INTERNAL ${EVENTS.length + events.length} · PARTNER 0` },
    { label: t("admin.sPartners"), value: partners.toLocaleString("th-TH") },
    { label: t("admin.sPending"), value: pending.toLocaleString("th-TH"), hint: pending > 0 ? t("admin.needReview") : undefined },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-ink">{t("admin.dashTitle")}</h1>
      <p className="mt-1 text-[14px] text-slate">{t("admin.dashSub")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-white p-5">
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{s.value}</p>
            {s.hint && <p className="mt-0.5 text-[12px] text-slate">{s.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/events" className="group flex items-center justify-between rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-e2">
          <div>
            <h2 className="text-lg font-semibold text-ink">{t("admin.manageEvents")}</h2>
            <p className="mt-1 text-[14px] text-slate">{t("admin.manageEventsSub")}</p>
          </div>
          <span className="text-brand transition-colors group-hover:text-brand-hover">→</span>
        </Link>
        <Link to="/admin/organizers" className="group flex items-center justify-between rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-e2">
          <div>
            <h2 className="text-lg font-semibold text-ink">{t("admin.orgCard")}</h2>
            <p className="mt-1 text-[14px] text-slate">{t("admin.orgCardSub")}</p>
          </div>
          <span className="flex items-center gap-2">
            {pending > 0 && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-[#8a6500]">{pending} {t("admin.reviewBadge")}</span>}
            <span className="text-brand transition-colors group-hover:text-brand-hover">→</span>
          </span>
        </Link>
      </div>
    </AdminShell>
  );
}
