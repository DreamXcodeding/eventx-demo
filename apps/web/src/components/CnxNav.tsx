import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/uiStore";
import { asset } from "../lib/asset";

// 2 แบบตาม Figma:
//  - dark  (frames 1/2 Home/Detail): พื้น navy, โลโก้ขาว, อยู่เหนือ hero เข้ม
//  - light (frame 3 /tickets ฯลฯ): พื้นขาว, โลโก้น้ำเงิน, ปุ่ม outline น้ำเงิน
const VARIANT = {
  dark: {
    header: "bg-navy",
    logo: "/cnx/eventx-logo.png",
    login: "border-white/40 text-brand-50 hover:bg-white/10",
    menuActive: "text-brand-50",
    menuIdle: "text-white/70 hover:text-white",
  },
  light: {
    header: "border-b border-line bg-white",
    logo: "/cnx/eventx-logo-color.png",
    login: "border-brand text-brand hover:bg-brand/5",
    menuActive: "text-brand",
    menuIdle: "text-slate hover:text-ink",
  },
} as const;

export default function CnxNav({ menu = false, variant = "dark" }: { menu?: boolean; variant?: "dark" | "light" }) {
  const { t } = useTranslation();
  const openLogin = useUiStore((s) => s.openLogin);
  const v = VARIANT[variant];

  const links = [
    { key: "nav.home", to: "/", active: true },
    { key: "nav.festival", to: "/" },
    { key: "nav.concert", to: "/" },
    { key: "nav.exhibition", to: "/" },
    { key: "nav.event", to: "/" },
  ];

  return (
    <header className={`sticky top-0 z-50 ${v.header}`}>
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-[60px]">
        <Link to="/" aria-label="EventX" className="flex shrink-0 items-center">
          <img src={asset(v.logo)} alt="EventX" className="h-7 w-auto sm:h-8" />
        </Link>

        {menu && (
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-[14px] transition-colors ${l.active ? `font-medium ${v.menuActive}` : v.menuIdle}`}
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={() => openLogin()} className={`inline-flex h-9 shrink-0 items-center rounded-xl border px-3 text-[13px] font-semibold transition-colors sm:h-10 sm:px-5 sm:text-[14px] ${v.login}`}>
            {t("header.login")}
          </button>
          <button onClick={() => openLogin()} className="inline-flex h-9 shrink-0 items-center rounded-xl bg-brand px-3 text-[13px] font-semibold text-white transition-all hover:bg-brand-hover active:scale-95 sm:h-10 sm:px-5 sm:text-[14px]">
            {t("login.signup")}
          </button>
        </div>
      </div>
    </header>
  );
}
