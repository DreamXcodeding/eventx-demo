import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/uiStore";
import { asset } from "../lib/asset";

// nav เข้มแบบ Figma — Home แสดงเมนู (menu), หน้า detail ไม่แสดง
export default function CnxNav({ menu = false }: { menu?: boolean }) {
  const { t } = useTranslation();
  const openLogin = useUiStore((s) => s.openLogin);

  const links = [
    { key: "nav.home", to: "/", active: true },
    { key: "nav.festival", to: "/" },
    { key: "nav.concert", to: "/" },
    { key: "nav.exhibition", to: "/" },
    { key: "nav.event", to: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center gap-6 px-6 lg:px-[60px]">
        <Link to="/" aria-label="EventX" className="flex shrink-0 items-center">
          <img src={asset("/cnx/eventx-logo.png")} alt="EventX" className="h-8 w-auto" />
        </Link>

        {menu && (
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-[14px] transition-colors ${
                  l.active ? "font-medium text-brand-50" : "text-white/70 hover:text-white"
                }`}
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => openLogin()} className="inline-flex h-10 items-center rounded-xl border border-white/40 px-5 text-[14px] font-semibold text-brand-50 transition-colors hover:bg-white/10">
            {t("header.login")}
          </button>
          <button onClick={() => openLogin()} className="inline-flex h-10 items-center rounded-xl bg-brand px-5 text-[14px] font-semibold text-white transition-all hover:bg-brand-hover active:scale-95">
            {t("login.signup")}
          </button>
        </div>
      </div>
    </header>
  );
}
