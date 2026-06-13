import { useState } from "react";
import { useTranslation } from "react-i18next";
import AffiliateShell from "../../components/AffiliateShell";
import { REFERRAL_LINKS, baseUrl } from "../../data/affiliate";

export default function AffiliateLinks() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<string | null>(null);

  const urlOf = (slug: string, code: string) => `${baseUrl}/events/${slug}?ref=${code}`;
  const copy = (id: string, url: string) => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  };

  return (
    <AffiliateShell>
      <h1 className="text-2xl font-semibold text-ink">{t("aff.linksPageTitle")}</h1>
      <p className="mt-1 text-[14px] text-slate">{t("aff.linksPageSub")}</p>

      <div className="mt-6 space-y-4">
        {REFERRAL_LINKS.map((l) => {
          const url = urlOf(l.slug, l.code);
          return (
            <div key={l.id} className="rounded-xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-ink">{l.eventTitle}</h2>
                  <p className="mt-0.5 text-[12px] text-muted">{l.clicks.toLocaleString("th-TH")} {t("aff.colClicks")} · {l.orders.toLocaleString("th-TH")} {t("aff.colOrders")}</p>
                </div>
                <span className="rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[12px] font-medium text-brand">{l.code}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input readOnly value={url} className="h-10 flex-1 truncate rounded-md border border-line bg-surface px-3 text-[13px] text-slate outline-none" />
                <button
                  onClick={() => copy(l.id, url)}
                  className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-95"
                >
                  {copied === l.id ? t("aff.copied") : t("aff.copy")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AffiliateShell>
  );
}
