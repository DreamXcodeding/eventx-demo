import { useEffect, useRef, useState } from "react";
import { useUiStore } from "../stores/uiStore";
import type { Locale } from "../stores/authStore";

const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "th", label: "TH", native: "ไทย" },
  { code: "en", label: "EN", native: "English" },
];

export default function LanguageSwitcher() {
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="เปลี่ยนภาษา"
        className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-brand/40 hover:bg-raised"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
        <span>{current.label}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="ecn-rise absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-e3"
          style={{ animationDuration: "0.12s" }}
        >
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <li key={l.code} role="option" aria-selected={active}>
                <button
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-[14px] transition-colors ${
                    active ? "text-brand" : "text-ink hover:bg-raised"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="inline-flex h-6 w-7 items-center justify-center rounded bg-raised text-[11px] font-semibold text-muted">{l.label}</span>
                    {l.native}
                  </span>
                  {active && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
