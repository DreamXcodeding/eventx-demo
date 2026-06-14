import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminShell from "../../components/AdminShell";
import DemoRoleGate from "../../components/DemoRoleGate";
import { useAdminStore, type OrgStatus } from "../../stores/adminStore";
import { api, type OrganizerAppDto } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { USE_MOCK } from "../../lib/http";

const STATUS_CLS: Record<OrgStatus, string> = {
  DISCUSSING: "bg-warning/15 text-[#8a6500]",
  APPROVED: "bg-success/10 text-success",
  REJECTED: "bg-error/10 text-error",
};
const STATUS_KEY: Record<OrgStatus, string> = { DISCUSSING: "admin.discussing", APPROVED: "admin.approved", REJECTED: "admin.rejected" };

export default function AdminOrganizers() {
  const { t } = useTranslation();
  const storeOrgs = useAdminStore((s) => s.organizers);
  const storeApprove = useAdminStore((s) => s.approveOrganizer);
  const storeReject = useAdminStore((s) => s.rejectOrganizer);
  const { data: apiOrgs, reload } = useApi<OrganizerAppDto[]>(() => api.admin.organizers(), []);
  const organizers = USE_MOCK ? storeOrgs : apiOrgs;

  const [fee, setFee] = useState<Record<string, string>>({});

  const approve = async (id: string, feeBps: number) => {
    if (USE_MOCK) storeApprove(id, feeBps);
    else { await api.admin.approveOrganizer(id, feeBps); reload(); }
  };
  const reject = async (id: string) => {
    if (USE_MOCK) storeReject(id);
    else { await api.admin.rejectOrganizer(id); reload(); }
  };

  return (
    <DemoRoleGate role="ADMIN">
      <AdminShell>
        <h1 className="text-2xl font-semibold text-ink">{t("admin.orgTitle")}</h1>
        <p className="mt-1 text-[14px] text-slate">{t("admin.orgSub")}</p>

        <div className="mt-6 space-y-4">
          {organizers.map((o) => {
            const status = o.status as OrgStatus;
            const feePct = o.feeBps != null ? (o.feeBps / 100).toString() : "";
            return (
              <div key={o.id} className="rounded-xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-ink">{o.company}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_CLS[status]}`}>{t(STATUS_KEY[status])}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-slate">{o.contact} · {o.phone}</p>
                    <p className="mt-1 text-[13px] text-slate">{t("admin.expectSell")} <span className="font-medium text-ink">{o.requestedTickets.toLocaleString("th-TH")}</span> {t("admin.unit")}</p>
                  </div>

                  <div className="text-right">
                    {status === "APPROVED" && o.feeBps != null && (
                      <p className="text-[13px] text-slate">{t("admin.fee")} <span className="text-xl font-semibold text-brand">{(o.feeBps / 100).toFixed(1)}%</span></p>
                    )}
                  </div>
                </div>

                {status === "DISCUSSING" && (
                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                    <div>
                      <label className="mb-1 block text-[13px] font-medium text-ink">{t("admin.feePct")}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min={0} max={50} step={0.5}
                          value={fee[o.id] ?? feePct}
                          onChange={(e) => setFee({ ...fee, [o.id]: e.target.value })}
                          placeholder="7"
                          className="h-10 w-28 rounded-md border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10"
                        />
                        <span className="text-slate">%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => approve(o.id, Math.round(Number(fee[o.id] ?? feePct) * 100))}
                      disabled={!(Number(fee[o.id] ?? feePct) > 0)}
                      className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-95 disabled:opacity-50"
                    >
                      {t("admin.approve")}
                    </button>
                    <button onClick={() => reject(o.id)} className="rounded-md border border-error/40 px-5 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/5">
                      {t("admin.reject")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AdminShell>
    </DemoRoleGate>
  );
}
