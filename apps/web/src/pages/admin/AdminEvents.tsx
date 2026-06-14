import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminShell from "../../components/AdminShell";
import DemoRoleGate from "../../components/DemoRoleGate";
import { useAdminStore } from "../../stores/adminStore";
import { EVENTS, formatTHB, CATEGORIES } from "../../data/events";
import { api, type AdminEventDto } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { USE_MOCK } from "../../lib/http";

const SOURCE_BADGE = "bg-brand/10 text-brand";

export default function AdminEvents() {
  const { t } = useTranslation();
  const storeCreated = useAdminStore((s) => s.events);
  const storeAdd = useAdminStore((s) => s.addEvent);
  const storePublish = useAdminStore((s) => s.publishEvent);
  const { data: apiEvents, reload } = useApi<AdminEventDto[]>(() => api.admin.events(), []);
  const createdList = USE_MOCK ? storeCreated : apiEvents;

  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", province: "เชียงใหม่", category: "festival", dateLabel: "", priceFrom: "" });

  const valid = f.title.trim() && f.dateLabel.trim() && Number(f.priceFrom) > 0;

  const create = async () => {
    if (!valid) return;
    if (USE_MOCK) {
      storeAdd({ id: `int-${Date.now()}`, title: f.title.trim(), province: f.province, category: f.category, dateLabel: f.dateLabel.trim(), priceFrom: Number(f.priceFrom), source: "INTERNAL", status: "DRAFT", createdAt: Date.now() });
    } else {
      await api.admin.createEvent({ title: f.title.trim(), province: f.province, category: f.category, dateLabel: f.dateLabel.trim(), priceFrom: Number(f.priceFrom) });
      reload();
    }
    setF({ title: "", province: "เชียงใหม่", category: "festival", dateLabel: "", priceFrom: "" });
    setOpen(false);
  };

  const publish = async (id: string) => {
    if (USE_MOCK) storePublish(id);
    else { await api.admin.publishEvent(id); reload(); }
  };

  const input = "h-10 w-full rounded-md border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10";
  const label = "mb-1 block text-[13px] font-medium text-ink";

  // รายการรวม: ที่แอดมินสร้าง + catalog (เผยแพร่แล้ว)
  const mine = createdList.map((e) => ({ id: e.id, title: e.title, province: e.province, category: e.category, dateLabel: e.dateLabel, priceFrom: e.priceFrom, status: e.status, created: true }));
  const catalog = EVENTS.map((e) => ({ id: e.id, title: e.title, province: e.province, category: e.category, dateLabel: e.dateLabel, priceFrom: e.priceFrom, status: "PUBLISHED" as const, created: false }));
  const all = [...mine, ...catalog];

  return (
    <DemoRoleGate role="ADMIN">
      <AdminShell>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{t("admin.evTitle")}</h1>
            <p className="mt-1 text-[14px] text-slate">{t("admin.evSub")}</p>
          </div>
          <button onClick={() => setOpen((o) => !o)} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95">
            {open ? t("admin.closeForm") : t("admin.createEvent")}
          </button>
        </div>

        {open && (
          <div className="mb-6 rounded-xl border border-line bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">{t("admin.newEvent")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className={label}>{t("admin.fName")}</label><input className={input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
              <div><label className={label}>{t("admin.fProvince")}</label><input className={input} value={f.province} onChange={(e) => setF({ ...f, province: e.target.value })} /></div>
              <div><label className={label}>{t("admin.fCategory")}</label>
                <select className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                  {CATEGORIES.filter((c) => c.key !== "all").map((c) => <option key={c.key} value={c.key}>{t(`cat.${c.key}`)}</option>)}
                </select>
              </div>
              <div><label className={label}>{t("admin.fDate")}</label><input className={input} placeholder="24–25 พ.ย. 2569" value={f.dateLabel} onChange={(e) => setF({ ...f, dateLabel: e.target.value })} /></div>
              <div><label className={label}>{t("admin.fPrice")}</label><input type="number" min={0} className={input} value={f.priceFrom} onChange={(e) => setF({ ...f, priceFrom: e.target.value })} /></div>
            </div>
            <button onClick={create} disabled={!valid} className="mt-4 rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-95 disabled:opacity-50">{t("admin.saveDraft")}</button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">{t("admin.colEvent")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("admin.colCat")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("admin.colDate")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("admin.colFrom")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("admin.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {all.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{e.title}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${SOURCE_BADGE}`}>INTERNAL</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate sm:table-cell">{t(`cat.${e.category}`)} · {e.province}</td>
                  <td className="hidden px-4 py-3 text-slate sm:table-cell">{e.dateLabel}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">{formatTHB(e.priceFrom)}</td>
                  <td className="px-4 py-3 text-right">
                    {e.status === "PUBLISHED" ? (
                      <span className="rounded-full bg-success/10 px-2 py-1 text-[11px] font-medium text-success">{t("admin.published")}</span>
                    ) : (
                      <button onClick={() => e.created && publish(e.id)} className="rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-medium text-[#8a6500] hover:bg-warning/25">{t("admin.draftPublish")}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </DemoRoleGate>
  );
}
