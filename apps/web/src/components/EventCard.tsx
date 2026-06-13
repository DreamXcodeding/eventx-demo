import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type Accent, type EcnEvent } from "../data/events";

// Thumbnail gradients (fallback เมื่อไม่มีรูป)
export const ACCENT_BG: Record<Accent, string> = {
  lantern: "linear-gradient(135deg, #f59e42, #b14d2e)",
  fireworks: "linear-gradient(135deg, #4e61ff, #7b8aff)",
  krathong: "linear-gradient(135deg, #d957b6, #7b3fe4)",
  concert: "linear-gradient(135deg, #2e6bff, #0a101f)",
  art: "linear-gradient(135deg, #df1b41, #7b2a4a)",
  outdoor: "linear-gradient(135deg, #43b75d, #0a5a3a)",
};
export const ACCENT_ICON: Record<Accent, string> = {
  lantern: "🏮", fireworks: "🎆", krathong: "🪷", concert: "🎵", art: "🎨", outdoor: "⛰️",
};

// สีป้ายหมวด (ตาม Figma)
const CAT_BADGE: Record<string, string> = {
  festival: "bg-[#FFF7E6] text-[#FFAA00]",
  concert: "bg-[#ECF8EF] text-success",
  exhibition: "bg-[#E6F4FF] text-info",
  workshop: "bg-brand-50 text-brand",
  outdoor: "bg-[#ECF8EF] text-success",
  default: "bg-brand-50 text-brand",
};

const IconPin = () => (<svg className="h-3.5 w-3.5 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconCalendar = () => (<svg className="h-3.5 w-3.5 shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
const IconClock = () => (<svg className="h-3.5 w-3.5 shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const IconTicket = () => (<svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M9 7v10" strokeDasharray="2 2" /></svg>);
const IconArrow = () => (<svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);

export default function EventCard({ ev }: { ev: EcnEvent }) {
  const { t } = useTranslation();
  const soldOut = ev.status === "SOLD_OUT";
  const badgeCls = CAT_BADGE[ev.category] ?? CAT_BADGE.default;

  return (
    <Link
      to={`/events/${ev.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-e2"
    >
      {/* รูป */}
      <div className="relative aspect-[4/5] shrink-0 overflow-hidden" style={{ background: ACCENT_BG[ev.accent] }}>
        {ev.image ? (
          <img
            src={ev.image}
            alt={ev.title}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${soldOut ? "grayscale" : ""}`}
          />
        ) : (
          <span className="absolute bottom-3 right-3 text-3xl drop-shadow-sm">{ACCENT_ICON[ev.accent]}</span>
        )}
        {soldOut && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy/40">
            <span className="rounded-md bg-white/95 px-4 py-1.5 text-sm font-semibold text-error">{t("card.soldOutOverlay")}</span>
          </div>
        )}
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{ev.title}</h3>
        <span className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-medium ${badgeCls}`}>{t(`cat.${ev.category}`)}</span>

        <div className="mt-0.5 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[12px] text-ink"><IconPin /> {ev.venue}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-success"><IconCalendar /> {ev.dateLabel}</p>
          {ev.timeLabel && <p className="flex items-center gap-1.5 text-[12px] text-success"><IconClock /> {ev.timeLabel}</p>}
        </div>

        {/* ปุ่ม */}
        <div className="mt-auto pt-3">
          {soldOut ? (
            <span className="flex items-center justify-center gap-2 rounded-lg bg-raised py-2.5 text-[14px] font-semibold text-muted">
              {t("card.full")} <IconArrow />
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-[14px] font-semibold text-white transition-colors group-hover:bg-brand-hover">
              <IconTicket /> {t("detail.buy")} <IconArrow />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
