import { useTranslation } from "react-i18next";
import { asset } from "../lib/asset";

// footer เข้มแบบ Figma — โลโก้ + tagline ซ้าย, social icons ขวา (SVG จริงจาก Figma)
const SOCIALS = ["facebook", "instagram", "threads", "github", "google"];

export default function CnxFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-6 py-8 sm:flex-row sm:items-end lg:px-[60px]">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <img src={asset("/cnx/eventx-logo.png")} alt="EventX" className="h-[45px] w-auto" />
          <p className="max-w-[210px] text-center text-[12px] leading-relaxed text-white sm:text-left">{t("footer.platformTagline")}</p>
        </div>
        <div className="flex items-center gap-3.5">
          {SOCIALS.map((s) => (
            <a key={s} href="#" aria-label={s} className="text-white transition-opacity hover:opacity-70">
              <img src={asset(`/cnx/icons/soc-${s}.svg`)} alt={s} className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
