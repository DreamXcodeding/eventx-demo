import { useState } from "react";
import { adsByPlacement } from "../data/ads";

export default function AnnouncementStrip() {
  const [closed, setClosed] = useState(false);
  const ad = adsByPlacement("strip")[0];
  if (!ad || closed) return null;

  return (
    <div className="relative bg-navy px-6 py-2 text-center text-[13px] text-white">
      <span className="mr-2 rounded-sm bg-white/10 px-1.5 py-0.5 text-[11px] text-white/70">โฆษณา · {ad.sponsor}</span>
      {ad.title}{" "}
      <a href={ad.href} className="font-medium text-[#9d97ff] underline-offset-2 hover:underline">
        {ad.cta} →
      </a>
      <button
        onClick={() => setClosed(true)}
        aria-label="ปิดประกาศ"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
