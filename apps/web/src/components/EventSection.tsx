import { useTranslation } from "react-i18next";
import EventCard from "./EventCard";
import type { EcnEvent } from "../data/events";

export default function EventSection({
  title,
  subtitle,
  events,
}: {
  title: string;
  subtitle?: string;
  events: EcnEvent[];
}) {
  const { t } = useTranslation();
  if (events.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-[15px] text-slate">{subtitle}</p>}
        </div>
        <a href="#" className="shrink-0 text-sm font-medium text-brand transition-colors hover:text-brand-hover">
          {t("home.seeAll")} →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {events.map((ev) => (
          <EventCard key={ev.id} ev={ev} />
        ))}
      </div>
    </section>
  );
}
