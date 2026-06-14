import { useTranslation } from "react-i18next";
import { asset } from "../lib/asset";

// footer เข้มแบบ Figma — โลโก้+tagline+social (บน), เส้นคั่น, copyright+ลิงก์ (ล่าง)
const SOCIALS = ["facebook", "instagram", "threads", "github", "google"];
const LINKS = ["footer.terms", "footer.privacy", "footer.cookies", "footer.contact"];

export default function CnxFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-[60px]">
        {/* บน: โลโก้ + tagline | social */}
        <div className="flex flex-col items-center justify-between gap-6 pt-9 pb-7 sm:flex-row sm:items-end">
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

        {/* เส้นคั่น */}
        <div className="border-t border-white/10" />

        {/* ล่าง: copyright (ชื่อบริษัท) | ลิงก์ policy/terms/cookies/ติดต่อ */}
        <div className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-[12px] text-white/60">{t("footer.rights")}</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LINKS.map((k) => (
              <a key={k} href="#" className="text-[12px] text-white/60 transition-colors hover:text-white">{t(k)}</a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
