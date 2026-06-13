import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HERO_SLIDES, formatTHB } from "../data/events";
import { ACCENT_BG, ACCENT_ICON } from "./EventCard";

export default function HeroCarousel() {
  const { t } = useTranslation();
  const slides = HERO_SLIDES;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const go = (n: number) => setI((n + slides.length) % slides.length);
  const s = slides[i];

  return (
    <section
      className="bg-navy-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto max-w-[1200px] px-6 py-10 sm:py-14">
        <div key={s.id} className="ecn-rise grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          {/* ข้อมูลอีเวนต์ */}
          <div>
            <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">{s.title}</h1>
            <p className="mt-3 max-w-lg text-[15px] text-white/70">{s.subtitle}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
              <span className="flex items-center gap-1.5"><span className="text-brand">◆</span> {s.dateLabel}</span>
              <span className="flex items-center gap-1.5"><span className="text-brand">⚲</span> {s.venue}</span>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <Link to={`/events/${s.slug}`} className="rounded-md bg-brand px-7 py-3 text-sm font-medium text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95">
                {t("hero.buy")}
              </Link>
              {s.priceFrom != null && <span className="text-sm text-white/70">{t("hero.from")} {formatTHB(s.priceFrom)}</span>}
            </div>
          </div>

          {/* ภาพ */}
          <div className="hidden justify-self-center sm:block">
            {s.image ? (
              <img src={s.image} alt={s.title} className="h-80 w-auto rounded-xl shadow-e3 ring-1 ring-white/15" />
            ) : (
              <div
                className="flex h-80 w-60 items-center justify-center rounded-xl text-7xl shadow-e3 ring-1 ring-white/15"
                style={{ background: ACCENT_BG[s.accent] }}
              >
                {ACCENT_ICON[s.accent]}
              </div>
            )}
          </div>
        </div>

        {/* Controls — ปุ่มซ้าย/ขวา อยู่คู่กับ dots ด้านล่าง (ไม่บังข้อความ) */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => go(i - 1)}
            aria-label="สไลด์ก่อนหน้า"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15 active:scale-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          <div className="flex items-center gap-2">
            {slides.map((sl, idx) => (
              <button
                key={sl.id}
                onClick={() => go(idx)}
                aria-label={`ไปสไลด์ ${idx + 1}`}
                aria-current={idx === i}
                className={`h-2 rounded-full transition-all ${idx === i ? "w-7 bg-white" : "w-2 bg-white/35 hover:bg-white/60"}`}
              />
            ))}
          </div>

          <button
            onClick={() => go(i + 1)}
            aria-label="สไลด์ถัดไป"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15 active:scale-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
