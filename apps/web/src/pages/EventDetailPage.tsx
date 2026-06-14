import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TicketPicker from "../components/TicketPicker";
import CnxNav from "../components/CnxNav";
import CnxFooter from "../components/CnxFooter";
import { getEventDetail } from "../data/eventDetail";
import { asset } from "../lib/asset";

/* ── inline icons (Figma stroke style) ── */
const S = "shrink-0";
const IconPin = ({ c = "h-4 w-4" }) => (<svg className={`${S} ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconCalendar = ({ c = "h-4 w-4" }) => (<svg className={`${S} ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
const IconClock = ({ c = "h-4 w-4" }) => (<svg className={`${S} ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const IconTicket = ({ c = "h-5 w-5" }) => (<svg className={`${S} ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M9 7v10" strokeDasharray="2 2" /></svg>);
const IconArrow = ({ c = "h-4 w-4" }) => (<svg className={`${S} ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);

// ไอคอนไฮไลท์ = SVG จริงจาก Figma (bicolor indigo+amber) ตามลำดับ label
const HL_IMG = ["hl-calendar", "hl-star", "hl-restart", "hl-pin", "hl-gift"].map((n) => asset(`/cnx/icons/${n}.svg`));

export default function EventDetailPage() {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const ev = getEventDetail(slug);

  if (!ev) {
    return (
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
        <CnxNav />
        <div className="mx-auto max-w-[1200px] px-6 py-24 text-center">
          <p className="text-lg text-ink">{t("detail.notFound")}</p>
          <Link to="/" className="mt-4 inline-block text-brand hover:underline">{t("detail.backHome")}</Link>
        </div>
        <CnxFooter />
      </div>
    );
  }

  const fromPrice = Math.min(...ev.ticketTypes.map((x) => x.price));
  const g = ev.gallery ?? [];
  // แกลเลอรี 2 แถว — รวมรูปแนวตั้ง (p:true) ตาม Figma · ลำดับความกว้างเหมือนกันทั้ง 2 แถว → ขอบซ้าย-ขวาตรงกัน
  const GAL_ROWS: { src: string; p?: boolean }[][] = g.length
    ? [
        [{ src: g[0] }, { src: g[1], p: true }, { src: g[2] }, { src: g[0] }, { src: g[1] }],
        [{ src: g[2] }, { src: g[0] }, { src: g[1] }, { src: g[2], p: true }, { src: g[0] }],
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <CnxNav />

      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden bg-navy">
        {ev.image ? (
          <>
            <img src={ev.image} alt={ev.title} className="absolute right-0 top-0 -z-10 h-full w-full object-cover object-[62%_50%] lg:w-[64%]" />
            <div className="cnx-hero-scrim absolute inset-0 -z-10" />
            {/* มือถือ/แท็บเล็ต: เพิ่มเงาล่างให้ราคา/ปุ่มอ่านชัด (รูป full-bleed) */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent lg:hidden" />
          </>
        ) : (
          <div className="bg-navy-hero absolute inset-0 -z-10" />
        )}
        <div className="mx-auto flex min-h-[clamp(440px,40vw,500px)] max-w-[1280px] flex-col justify-start px-6 pb-16 pt-14">
          <h1 className="max-w-[15ch] text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow sm:text-[48px]">{ev.title}</h1>
          {ev.subtitle && <p className="mt-3 max-w-[26rem] text-[18px] font-semibold leading-relaxed text-white">{ev.subtitle}</p>}

          {/* chips — 2 บรรทัด (วันที่+เวลา / สถานที่) ตาม Figma */}
          <div className="mt-5 space-y-2 text-[16px] text-white">
            <div className="flex flex-wrap items-center gap-x-9 gap-y-2">
              <span className="inline-flex items-center gap-2"><IconCalendar /> {ev.dateLabel}</span>
              {ev.timeLabel && <span className="inline-flex items-center gap-2"><IconClock /> {ev.timeLabel}</span>}
            </div>
            <span className="inline-flex items-center gap-2"><IconPin /> {ev.locationLabel ?? `${ev.venue}, ${ev.province}`}</span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <p className="text-[16px] text-white">{t("detail.startPrice")}</p>
              <p className="text-[40px] font-semibold leading-tight text-white drop-shadow">฿ {fromPrice.toLocaleString("th-TH")}</p>
            </div>
            {ev.status !== "SOLD_OUT" && (
              <button
                onClick={() => document.getElementById("ticket")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-3.5 text-[18px] font-semibold text-white shadow-brand transition-all hover:bg-brand-hover active:scale-95"
              >
                <IconTicket /> {t("detail.buyNow")} <IconArrow />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── ไฮไลท์ของงาน (การ์ดขาวลอยทับ hero) ── */}
      <div className="mx-auto max-w-[1160px] px-6">
        <div className="relative z-10 -mt-6 rounded-2xl border border-line bg-white px-6 py-7 shadow-e3">
          <h2 className="mb-5 text-[24px] font-semibold text-ink">{t("detail.highlights")}</h2>
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {ev.highlights.slice(0, 5).map((h, i) => (
              <div key={h.title} className="flex flex-col items-center gap-2.5 px-1 text-center">
                <img src={HL_IMG[i] ?? HL_IMG[0]} alt="" className="h-11 w-11 sm:h-[52px] sm:w-[52px]" />
                <p className="text-[14px] font-semibold leading-snug text-ink sm:text-[18px]">{h.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY (2 คอลัมน์) ── */}
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-y-10 px-6 pt-12 pb-12 lg:grid-cols-[1fr_460px] lg:gap-x-[110px] lg:pb-14">
        {/* ซ้าย: about → FAQ → ข้อกำหนด */}
        <div className="min-w-0 space-y-11">
          <section id="about" className="scroll-mt-24">
            <h2 className="mb-3 text-[24px] font-semibold text-ink">{t("detail.about")}</h2>
            <p className="text-[18px] font-semibold leading-relaxed text-ink">{ev.description}</p>
          </section>

          <section id="faq" className="scroll-mt-24">
            <h2 className="mb-4 text-[24px] font-semibold text-ink">{t("detail.faq")}</h2>
            <div className="space-y-2.5">
              {ev.faq.map((f, i) => (
                <details key={f.q} open={i === 0} className="group overflow-hidden rounded-xl border border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[14px] font-semibold text-ink marker:hidden transition-colors hover:bg-surface group-open:bg-brand-50">
                    {f.q}
                    <svg className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </summary>
                  <p className="bg-brand-50/60 px-4 pb-4 pt-1 text-[14px] leading-relaxed text-ink">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section id="terms" className="scroll-mt-24">
            <h2 className="mb-3 text-[24px] font-semibold text-ink">{t("detail.terms")}</h2>
            <p className="max-w-[40ch] text-[14px] leading-loose text-ink">{ev.terms.join("  ")}</p>
          </section>
        </div>

        {/* ขวา: เลือกบัตร (sticky) */}
        <aside id="ticket" className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <TicketPicker ev={ev} />
        </aside>
      </div>

      {/* ── บรรยากาศภายในงาน (2 แถว กว้างเท่ากัน + มีรูปแนวตั้ง เลื่อนได้ + เฟดขาวขอบซ้าย-ขวา) ── */}
      {GAL_ROWS.length > 0 && (
        <section id="gallery" className="scroll-mt-24 pb-16">
          <div className="mx-auto max-w-[1160px] px-6">
            <h2 className="mb-5 text-[24px] font-semibold text-ink">{t("detail.gallery")}</h2>
          </div>
          <div className="relative mx-auto max-w-[1280px]">
            {/* เฟดขาวขอบซ้าย-ขวา (แสงขาว) — กว้างเท่ากันทั้งสองด้าน */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-28" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-28" />

            {/* แทร็กเลื่อน 2 แถว (ขอบซ้าย-ขวาตรงกัน) */}
            <div className="overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max flex-col gap-2.5 sm:gap-3">
                {GAL_ROWS.map((row, r) => (
                  <div key={r} className="flex gap-2.5 sm:gap-3">
                    {row.map((cell, i) => (
                      <img
                        key={i}
                        src={cell.src}
                        alt={`${ev.title} ${r + 1}-${i + 1}`}
                        loading="lazy"
                        draggable={false}
                        className={`h-[150px] shrink-0 rounded-2xl object-cover sm:h-[200px] ${cell.p ? "w-[96px] sm:w-[132px]" : "w-[200px] sm:w-[280px]"}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <CnxFooter />
    </div>
  );
}
