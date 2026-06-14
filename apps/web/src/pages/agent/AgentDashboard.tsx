import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AgentShell from "../../components/AgentShell";
import DemoRoleGate from "../../components/DemoRoleGate";
import { useAgentStore } from "../../stores/agentStore";
import { formatTHB } from "../../data/events";
import { api, type AgentBookingDto } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { USE_MOCK } from "../../lib/http";

export default function AgentDashboard() {
  const { t } = useTranslation();
  const storeBookings = useAgentStore((s) => s.bookings);
  const { data: apiBookings } = useApi<AgentBookingDto[]>(() => api.agent.bookings(), []);
  const bookings = USE_MOCK ? storeBookings : apiBookings;

  const totalTickets = bookings.reduce((n, b) => n + b.qty, 0);
  const customers = new Set(bookings.map((b) => b.customerEmail)).size;
  const outstanding = bookings.reduce((n, b) => n + b.amount, 0);

  const stats = [
    { label: t("agent.sBookings"), value: bookings.length.toLocaleString("th-TH"), hint: `${totalTickets} ${t("agent.tickets")}` },
    { label: t("agent.sCustomers"), value: customers.toLocaleString("th-TH"), hint: t("agent.people") },
    { label: t("agent.sOutstanding"), value: formatTHB(outstanding), hint: t("agent.outHint") },
  ];

  return (
    <DemoRoleGate role="AGENT">
      <AgentShell>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{t("agent.dashTitle")}</h1>
            <p className="mt-1 text-[14px] text-slate">{t("agent.dashSub")}</p>
          </div>
          <Link to="/agent/book" className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95">
            {t("agent.newBooking")}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-white p-5">
              <p className="text-[13px] text-muted">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{s.value}</p>
              <p className="mt-0.5 text-[12px] text-slate">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-ink">{t("agent.recent")}</h2>
          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
              <p className="text-ink">{t("agent.empty")}</p>
              <p className="mt-1 text-[13px] text-slate">{t("agent.emptySub")}</p>
              <Link to="/agent/book" className="mt-4 inline-block rounded-md bg-brand px-5 py-2 text-sm font-medium text-white">{t("agent.first")}</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">{t("agent.colNo")}</th>
                    <th className="px-4 py-3 font-medium">{t("agent.colEvent")}</th>
                    <th className="px-4 py-3 font-medium">{t("agent.colTicket")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("agent.colAmount")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("agent.colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-mono text-[12px] text-slate">{b.bookingNo}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{b.eventTitle}</p>
                        <p className="text-[12px] text-slate">{b.customerName} · {b.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-slate">{b.ticketName} × {b.qty}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">{formatTHB(b.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-success/10 px-2 py-1 text-[11px] font-medium text-success">COMPLETED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AgentShell>
    </DemoRoleGate>
  );
}
