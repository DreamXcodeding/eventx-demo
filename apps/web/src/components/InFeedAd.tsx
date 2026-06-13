import { adsByPlacement } from "../data/ads";

export default function InFeedAd({ index = 0 }: { index?: number }) {
  const ads = adsByPlacement("infeed");
  const ad = ads[index];
  if (!ad) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-6">
      <a
        href={ad.href}
        className="group flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-6 transition-shadow hover:shadow-e2 sm:flex-row sm:items-center sm:justify-between sm:p-7"
      >
        <div className="flex items-center gap-4">
          <span className="hidden text-4xl sm:block">{ad.emoji}</span>
          <div>
            <span className="mb-1 inline-block rounded-sm bg-navy/5 px-2 py-0.5 text-[11px] text-muted">
              โฆษณา · {ad.sponsor}
            </span>
            <h3 className="text-xl font-semibold tracking-tight text-ink">{ad.title}</h3>
            {ad.subtitle && <p className="mt-0.5 text-[15px] text-slate">{ad.subtitle}</p>}
          </div>
        </div>
        <span className="shrink-0 rounded-md border border-brand/40 px-5 py-2 text-sm font-medium text-brand transition-colors group-hover:bg-brand/5">
          {ad.cta} →
        </span>
      </a>
    </section>
  );
}
