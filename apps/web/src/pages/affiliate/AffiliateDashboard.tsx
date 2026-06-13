import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AffiliateShell from "../../components/AffiliateShell";
import { REFERRAL_LINKS, COMMISSIONS, REFERRED_USERS } from "../../data/affiliate";
import { useAffiliateAccountStore } from "../../stores/affiliateAccountStore";
import { formatTHB } from "../../data/events";

export default function AffiliateDashboard() {
  const { t } = useTranslation();
  const registered = useAffiliateAccountStore((s) => s.registered);

  // ยังไม่สมัคร → ชวนสมัครก่อน (สมัครแล้วใช้ dashboard ตัวเดียวกันนี้)
  if (!registered) {
    return (
      <AffiliateShell>
        <div className="mx-auto max-w-lg rounded-xl border border-line bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-2xl text-brand">🔗</div>
          <h1 className="text-2xl font-semibold text-ink">{t("aff.joinTitle")}</h1>
          <p className="mt-2 text-[14px] text-slate">{t("aff.joinSub")}</p>
          <Link to="/affiliate/apply" className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95">
            {t("aff.joinCta")}
          </Link>
        </div>
      </AffiliateShell>
    );
  }

  const clicks = REFERRAL_LINKS.reduce((n, l) => n + l.clicks, 0);
  const orders = REFERRAL_LINKS.reduce((n, l) => n + l.orders, 0);
  const revenue = REFERRAL_LINKS.reduce((n, l) => n + l.revenue, 0);
  const earned = COMMISSIONS.reduce((n, c) => n + c.amount, 0);
  const pending = COMMISSIONS.filter((c) => c.status === "PENDING").reduce((n, c) => n + c.amount, 0);
  const conv = clicks ? ((orders / clicks) * 100).toFixed(1) : "0";

  const stats = [
    { label: t("aff.sClicks"), value: clicks.toLocaleString("th-TH") },
    { label: t("aff.sOrders"), value: orders.toLocaleString("th-TH"), hint: `${t("aff.conversion")} ${conv}%` },
    { label: t("aff.sRevenue"), value: formatTHB(revenue) },
    { label: t("aff.sPending"), value: formatTHB(pending), accent: true, hint: `${t("aff.totalEarned")} ${formatTHB(earned)}` },
  ];

  return (
    <AffiliateShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t("aff.dashTitle")}</h1>
          <p className="mt-1 text-[14px] text-slate">{t("aff.dashSub")}</p>
        </div>
        <button className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95">{t("aff.withdraw")}</button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? "border-brand/30 bg-brand/5" : "border-line bg-white"}`}>
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${s.accent ? "text-brand" : "text-ink"}`}>{s.value}</p>
            {s.hint && <p className="mt-0.5 text-[12px] text-slate">{s.hint}</p>}
          </div>
        ))}
      </div>

      {/* ลิงก์แนะนำ */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">{t("aff.linksTitle")}</h2>
        <Link to="/affiliate/links" className="text-sm font-medium text-brand hover:text-brand-hover">{t("aff.manageLinks")} →</Link>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">{t("aff.colEventCode")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colClicks")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colOrders")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colRevenue")}</th>
            </tr>
          </thead>
          <tbody>
            {REFERRAL_LINKS.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{l.eventTitle}</p>
                  <p className="font-mono text-[12px] text-brand">?ref={l.code}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate">{l.clicks.toLocaleString("th-TH")}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">{l.orders.toLocaleString("th-TH")}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">{formatTHB(l.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* คอมมิชชั่นล่าสุด */}
      <h2 className="mt-8 mb-3 text-lg font-semibold text-ink">{t("aff.commTitle")}</h2>
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">{t("aff.colOrder")}</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("aff.colEvent")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colComm")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {COMMISSIONS.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-mono text-[12px] text-slate">{c.orderNo}</p>
                  <p className="text-[11px] text-muted">{c.date}</p>
                </td>
                <td className="hidden px-4 py-3 text-slate sm:table-cell">{c.eventTitle}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-brand">{formatTHB(c.amount)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${c.status === "PENDING" ? "bg-warning/15 text-[#8a6500]" : "bg-success/10 text-success"}`}>
                    {c.status === "PENDING" ? t("aff.pending") : t("aff.settled")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ผู้ใช้ที่แนะนำมา (จุดต่างของ affiliate) */}
      <h2 className="mt-8 mb-3 text-lg font-semibold text-ink">{t("aff.referred")}</h2>
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">{t("aff.colUser")}</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("aff.colJoined")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colOrders")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colSpent")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("aff.colYourComm")}</th>
            </tr>
          </thead>
          <tbody>
            {REFERRED_USERS.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{u.name}</p>
                  <p className="text-[12px] text-slate">{u.email}</p>
                </td>
                <td className="hidden px-4 py-3 text-slate sm:table-cell">{u.joined}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">{u.orders}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate">{formatTHB(u.spent)}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-brand">{formatTHB(u.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-muted">{t("aff.pdpaNote")}</p>
    </AffiliateShell>
  );
}
