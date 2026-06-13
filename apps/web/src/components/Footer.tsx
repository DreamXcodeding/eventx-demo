import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-8 border-t border-line bg-navy">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">EventX</span>
          <p className="text-sm text-white/70">{t("footer.tagline")}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
          <a href="#" className="transition-colors hover:text-white">{t("footer.about")}</a>
          <a href="#" className="transition-colors hover:text-white">{t("footer.privacy")}</a>
          <a href="#" className="transition-colors hover:text-white">{t("footer.terms")}</a>
          <Link to="/organizer" className="transition-colors hover:text-white">{t("footer.forOrganizer")}</Link>
          <Link to="/agent" className="transition-colors hover:text-white">{t("footer.agentPortal")}</Link>
          <Link to="/affiliate" className="transition-colors hover:text-white">{t("footer.affiliatePortal")}</Link>
          <Link to="/admin" className="transition-colors hover:text-white">{t("footer.admin")}</Link>
          <a href="#" className="transition-colors hover:text-white">{t("footer.contact")}</a>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/50">{t("footer.rights")}</p>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/60">
            <span>{t("footer.supports")}</span>
            {["PromptPay", "Card", "Alipay", "WeChat"].map((m) => (
              <span key={m} className="rounded border border-white/15 px-2 py-0.5">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
