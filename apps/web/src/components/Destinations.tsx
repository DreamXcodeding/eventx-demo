import { useTranslation } from "react-i18next";
import { DESTINATIONS } from "../data/events";
import { ACCENT_BG } from "./EventCard";

export default function Destinations() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-6">
        <h2 className="text-[28px] font-semibold tracking-tight text-ink">{t("home.destinations")}</h2>
        <p className="mt-1 text-[15px] text-slate">{t("home.destinationsSub")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {DESTINATIONS.map((d) => (
          <a
            key={d.name}
            href="#"
            className="group relative h-28 overflow-hidden rounded-lg border border-line transition-all duration-200 hover:-translate-y-1 hover:shadow-e2"
            style={{ background: ACCENT_BG[d.accent] }}
          >
            <div className="absolute inset-0 bg-navy/30" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <span className="text-lg font-semibold text-white">{d.name}</span>
              <span className="text-[12px] text-white/80">{d.count} อีเวนต์</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
