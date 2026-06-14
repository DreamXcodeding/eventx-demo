import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/uiStore";
import { asset } from "../lib/asset";

// nav พื้นขาว (MacBook Air - 3) — โลโก้น้ำเงิน + ปุ่ม outline/filled น้ำเงิน · Home แสดงเมนู
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
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-[60px]">
        <Link to="/" aria-label="EventX" className="flex shrink-0 items-center">
          <img src={asset("/cnx/eventx-logo-color.png")} alt="EventX" className="h-7 w-auto sm:h-8" />
        </Link>

        {menu && (
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-[14px] transition-colors ${
                  l.active ? "font-medium text-brand" : "text-slate hover:text-ink"
                }`}
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={() => openLogin()} className="inline-flex h-9 shrink-0 items-center rounded-xl border border-brand px-3 text-[13px] font-semibold text-brand transition-colors hover:bg-brand/5 sm:h-10 sm:px-5 sm:text-[14px]">
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
