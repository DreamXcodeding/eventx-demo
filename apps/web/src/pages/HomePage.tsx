import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CnxNav from "../components/CnxNav";
import CnxFooter from "../components/CnxFooter";
import EventCard from "../components/EventCard";
import { EVENTS, HERO_SLIDES, formatTHB } from "../data/events";
import { useAffiliateCapture } from "../lib/useAffiliateCapture";

/* ── icons ── */
const IconPin = () => (<svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconCalendar = () => (<svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
const IconClock = () => (<svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const IconSearch = () => (<svg className="h-5 w-5 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
const IconTicket = () => (<svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M9 7v10" strokeDasharray="2 2" /></svg>);
const IconArrow = () => (<svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);

const CATS = [
  { key: "all", label: "cat.all" },
  { key: "event", label: "nav.event" },
  { key: "festival", label: "nav.festival" },
  { key: "concert", label: "nav.concert" },
  { key: "exhibition", label: "nav.exhibition" },
];

export default function HomePage() {
  useAffiliateCapture();
  const { t } = useTranslation();
  const [category, setCategory] = useState("all");
  const slides = HERO_SLIDES;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const go = (n: number) => setI((n + slides.length) % slides.length);
  const s = slides[i];

  const shown = useMemo(
    () => (category === "all" || category === "event" ? EVENTS : EVENTS.filter((e) => e.category === category)),
    [category]
  );
  const soon = useMemo(() => [...EVENTS].sort((a, b) => b.reviews - a.reviews).slice(0, 4), []);

  const tags = [t("home.tagLoy"), t("home.tagLantern"), t("home.tagCountdown")];

  return (
    <div className="min-h-screen bg-white">
      <CnxNav menu />

      {/* ── HERO banner (carousel) ── */}
      <section className="relative isolate overflow-hidden bg-navy">
        {s.image ? (
          <>
            <img src={s.image} alt={s.title} className="absolute right-0 top-0 -z-10 h-full w-full object-cover object-[62%_50%] lg:w-[64%]" />
            <div className="cnx-hero-scrim absolute inset-0 -z-10" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent lg:hidden" />
          </>
        ) : (
          <div className="bg-navy-hero absolute inset-0 -z-10" />
        )}
        <div key={s.id} className="ecn-rise mx-auto flex min-h-[clamp(360px,38vw,440px)] max-w-[1280px] flex-col justify-center px-6 py-12">
          <h1 className="max-w-[15ch] text-4xl font-bold leading-tight tracking-tight text-white drop-shadow sm:text-5xl">{s.title}</h1>
          <p className="mt-3 max-w-[44ch] text-[15px] text-white/85">{s.subtitle}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-white/90">
            <span className="inline-flex items-center gap-2"><IconCalendar /> {s.dateLabel}</span>
            <span className="inline-flex items-center gap-2"><IconClock /> 16:00 - 23:00 น.</span>
            <span className="inline-flex items-center gap-2"><IconPin /> {s.venue}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to={`/events/${s.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-3 text-[15px] font-semibold text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95">
              <IconTicket /> {t("hero.buy")}
            </Link>
            {s.priceFrom != null && <span className="text-[14px] text-white/80">{t("hero.from")} {formatTHB(s.priceFrom)}</span>}
          </div>

          {/* arrows + dots */}
          {slides.length > 1 && (
            <>
              <button onClick={() => go(i - 1)} aria-label="ก่อนหน้า" className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15 active:scale-90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button onClick={() => go(i + 1)} aria-label="ถัดไป" className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15 active:scale-90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
              </button>
              <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
                {slides.map((sl, idx) => (
                  <button key={sl.id} onClick={() => go(idx)} aria-label={`สไลด์ ${idx + 1}`} aria-current={idx === i} className={`h-2 rounded-full transition-all ${idx === i ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── floating search ── */}
      <div className="relative z-10 mx-auto -mt-9 max-w-[1000px] px-6">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-e3">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2.5 rounded-lg bg-surface px-4 py-3">
              <IconSearch />
              <input className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" placeholder={t("home.searchPh")} />
            </div>
            <button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-brand-hover active:scale-95">
              {t("header.searchBtn")} <IconArrow />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-slate">{t("home.popular")}</span>
            {tags.map((tag) => (
              <button key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-[12px] font-medium text-brand transition-colors hover:bg-brand/15">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── จัดขึ้นเร็วๆนี้ ── */}
      <section className="mx-auto max-w-[1280px] px-6 pt-12">
        <h2 className="mb-5 text-[22px] font-semibold text-ink">{t("home.comingSoon")}</h2>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {soon.map((ev) => <EventCard key={ev.id} ev={ev} />)}
        </div>
      </section>

      {/* ── งานทั้งหมด ── */}
      <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-semibold text-ink">{t("home.allEvents")}</h2>
          <button className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:border-brand/40">
            <svg className="h-4 w-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            {t("home.thisYear")}
            <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>

        {/* category chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATS.map((c) => {
            const on = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${on ? "bg-brand text-white" : "bg-brand-50 text-brand hover:bg-brand/15"}`}
              >
                {t(c.label)}
              </button>
            );
          })}
        </div>

        {shown.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {shown.map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </div>
        ) : (
          <p className="py-16 text-center text-[15px] text-muted">{t("home.results")} — 0</p>
        )}
      </section>

      <CnxFooter />
    </div>
  );
}
