import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EventCard from "./EventCard";
import type { EcnEvent } from "../data/events";

// แถวอีเวนต์เลื่อนแนวนอน (แนว EventPass "กำลังจะมาถึง") + ตัวเรียง + ปุ่มเลื่อน
export default function EventRow({
  id,
  title,
  subtitle,
  events,
  sortable = false,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  events: EcnEvent[];
  sortable?: boolean;
}) {
  const { t } = useTranslation();
  const scroller = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<"all" | "soon">("all");

  const list =
    sortable && sort === "soon"
      ? [...events].sort((a, b) => (a.status === "COMING_SOON" ? -1 : 1) - (b.status === "COMING_SOON" ? -1 : 1))
      : events;

  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  if (events.length === 0) return null;
  return (
    <section id={id} className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[28px] font-semibold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-[15px] text-slate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {sortable && (
            <div className="flex gap-1.5">
              {([["all", t("sort.all")], ["soon", t("sort.soon")]] as const).map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${sort === k ? "border-brand bg-brand/10 text-brand" : "border-line text-slate hover:border-brand/40"}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          )}
          <div className="hidden gap-1.5 sm:flex">
            <button onClick={() => scroll(-1)} aria-label="เลื่อนซ้าย" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface active:scale-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button onClick={() => scroll(1)} aria-label="เลื่อนขวา" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface active:scale-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} className="flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.map((ev) => (
          <div key={ev.id} className="w-[260px] shrink-0 snap-start">
            <EventCard ev={ev} />
          </div>
        ))}
      </div>
    </section>
  );
}
