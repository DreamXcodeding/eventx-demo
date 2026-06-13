import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminShell from "../../components/AdminShell";
import { USERS, type UserRole, type DirUser } from "../../data/users";

const FILTERS: { key: "all" | UserRole; tk: string }[] = [
  { key: "all", tk: "adminUsers.all" },
  { key: "CUSTOMER", tk: "adminUsers.customer" },
  { key: "AGENT", tk: "adminUsers.agent" },
  { key: "AFFILIATE", tk: "adminUsers.affiliate" },
  { key: "ORGANIZER", tk: "adminUsers.organizer" },
];

const ROLE_TK: Record<UserRole, string> = {
  CUSTOMER: "adminUsers.customer",
  AGENT: "adminUsers.agent",
  AFFILIATE: "adminUsers.affiliate",
  ORGANIZER: "adminUsers.organizer",
};

const ROLE_CLS: Record<UserRole, string> = {
  CUSTOMER: "bg-brand/10 text-brand",
  AGENT: "bg-[#fff4d6] text-[#8a6500]",
  AFFILIATE: "bg-success/10 text-success",
  ORGANIZER: "bg-navy/10 text-navy",
};

export default function AdminUsers() {
  const { t } = useTranslation();
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<DirUser | null>(null);

  const list = useMemo(() => {
    return USERS.filter((u) => (role === "all" || u.role === role) && (q.trim() === "" || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.trim().toLowerCase())));
  }, [role, q]);

  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold text-ink">{t("adminUsers.title")}</h1>
      <p className="mt-1 text-[14px] text-slate">{t("adminUsers.sub")}</p>

      {/* filter + search */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setRole(f.key)}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${role === f.key ? "border-brand bg-brand/10 text-brand" : "border-line text-slate hover:border-brand/40"}`}
          >
            {t(f.tk)}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("adminUsers.search")}
          className="ml-auto h-9 w-full max-w-[240px] rounded-md border border-line bg-white px-3 text-[14px] text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10"
        />
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* table */}
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">{t("adminUsers.colUser")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("adminUsers.colRole")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("adminUsers.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={`cursor-pointer border-b border-line last:border-0 transition-colors hover:bg-surface ${selected?.id === u.id ? "bg-brand/5" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{u.name}</p>
                    <p className="text-[12px] text-slate">{u.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${ROLE_CLS[u.role]}`}>{t(ROLE_TK[u.role])}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${u.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {u.status === "ACTIVE" ? t("adminUsers.active") : t("adminUsers.suspended")}
                    </span>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-slate">{t("adminUsers.notFound")}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* detail panel */}
        <aside className="h-fit rounded-xl border border-line bg-white p-5 lg:sticky lg:top-24">
          {selected ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">{selected.name.charAt(0)}</div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{selected.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_CLS[selected.role]}`}>{t(ROLE_TK[selected.role])}</span>
                </div>
              </div>
              <dl className="mt-4 space-y-2.5 text-[14px]">
                <Row label={t("adminUsers.email")} value={selected.email} />
                <Row label={t("adminUsers.phone")} value={selected.phone} />
                <Row label={t("adminUsers.joined")} value={selected.joined} />
                <Row label={t("adminUsers.orders")} value={selected.orders.toLocaleString("th-TH")} />
                <Row label={t("adminUsers.status")} value={selected.status === "ACTIVE" ? t("adminUsers.active") : t("adminUsers.suspended")} />
                {selected.note && <Row label={t("adminUsers.note")} value={selected.note} />}
              </dl>
              <div className="mt-4 flex gap-2 border-t border-line pt-4">
                {selected.status === "ACTIVE" ? (
                  <button className="flex-1 rounded-md border border-error/40 py-2 text-sm font-medium text-error transition-colors hover:bg-error/5">{t("adminUsers.suspend")}</button>
                ) : (
                  <button className="flex-1 rounded-md border border-success/40 py-2 text-sm font-medium text-success transition-colors hover:bg-success/5">{t("adminUsers.activate")}</button>
                )}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-[14px] text-slate">{t("adminUsers.selectUser")}</div>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-slate">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
