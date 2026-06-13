import { useEffect, useState } from "react";
import { adsByPlacement } from "../data/ads";

export default function AdCarousel() {
  const ads = adsByPlacement("carousel");
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || ads.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % ads.length), 5000);
    return () => clearInterval(t);
  }, [paused, ads.length]);

  if (ads.length === 0) return null;
  const ad = ads[i];

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-6">
      <div
        className="relative overflow-hidden rounded-xl bg-navy-hero shadow-e2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <a href={ad.href} className="group block">
          <div className="grid items-center gap-4 p-7 sm:grid-cols-[1fr_auto] sm:p-9">
            <div>
              <span className="mb-2 inline-block rounded-sm bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                โฆษณา · {ad.sponsor}
              </span>
              <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{ad.title}</h3>
              {ad.subtitle && <p className="mt-1 text-[15px] text-white/70">{ad.subtitle}</p>}
              <span className="mt-4 inline-block rounded-md bg-brand px-5 py-2 text-sm font-medium text-white transition-colors group-hover:bg-brand-hover">
                {ad.cta}
              </span>
            </div>
            <div className="hidden text-7xl sm:block">{ad.emoji}</div>
          </div>
        </a>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {ads.map((a, idx) => (
            <button
              key={a.id}
              onClick={() => setI(idx)}
              aria-label={`โฆษณาที่ ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
