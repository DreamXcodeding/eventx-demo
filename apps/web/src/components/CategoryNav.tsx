import { useTranslation } from "react-i18next";
import { CATEGORIES } from "../data/events";

export default function CategoryNav({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="flex flex-wrap justify-center gap-2.5">
        {CATEGORIES.map((c) => {
          const on = c.key === active;
          return (
            <button
              key={c.key}
              onClick={() => onChange(c.key)}
              className={`flex items-center gap-2 rounded-md border px-4 py-2 text-[13px] font-medium transition-colors ${
                on
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-slate hover:border-brand/40 hover:text-ink"
              }`}
            >
              <span className="text-base">{c.icon}</span>
              {t(`cat.${c.key}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
