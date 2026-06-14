import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/uiStore";
import { useAuthStore, type UserRole } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import { asset } from "../lib/asset";

// 2 แบบตาม Figma: dark (Home/Detail เหนือ hero) · light (frame 3 /tickets ฯลฯ)
const VARIANT = {
  dark: {
    header: "bg-navy",
    logo: "/cnx/eventx-logo.png",
    login: "border-white/40 text-brand-50 hover:bg-white/10",
    menuActive: "text-brand-50",
    menuIdle: "text-white/70 hover:text-white",
    user: "text-white hover:bg-white/10",
    cart: "text-white hover:bg-white/10",
  },
  light: {
    header: "border-b border-line bg-white",
    logo: "/cnx/eventx-logo-color.png",
    login: "border-brand text-brand hover:bg-brand/5",
    menuActive: "text-brand",
    menuIdle: "text-slate hover:text-ink",
    user: "text-ink hover:bg-surface",
    cart: "text-ink hover:bg-surface",
  },
} as const;

const DASH_BY_ROLE: Partial<Record<UserRole, string>> = { AFFILIATE: "/affiliate", AGENT: "/agent", ADMIN: "/admin", ORGANIZER: "/organizer" };

export default function CnxNav({ menu = false, variant = "dark" }: { menu?: boolean; variant?: "dark" | "light" }) {
  const { t } = useTranslation();
  const openLogin = useUiStore((s) => s.openLogin);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const v = VARIANT[variant];

  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const links = [
    { key: "nav.home", to: "/", active: true },
    { key: "nav.festival", to: "/" },
    { key: "nav.concert", to: "/" },
    { key: "nav.exhibition", to: "/" },
    { key: "nav.event", to: "/" },
  ];
  const dash = user ? DASH_BY_ROLE[user.role] : undefined;
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <header className={`sticky top-0 z-50 ${v.header}`}>
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-[60px]">
        <Link to="/" aria-label="EventX" className="flex shrink-0 items-center">
          <img src={asset(v.logo)} alt="EventX" className="h-7 w-auto sm:h-8" />
        </Link>

        {menu && (
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link key={l.key} to={l.to} className={`rounded-md px-3 py-1.5 text-[14px] transition-colors ${l.active ? `font-medium ${v.menuActive}` : v.menuIdle}`}>
                {t(l.key)}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          {/* ตะกร้า → checkout */}
          <button onClick={() => navigate("/checkout")} aria-label="ตะกร้า" className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${v.cart}`}>
            <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">{cartCount}</span>
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setMenuOpen((o) => !o)} className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-[14px] font-medium transition-colors ${v.user}`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{user.name.charAt(0)}</span>
                <span className="hidden max-w-[120px] truncate sm:inline">{user.name}</span>
                <svg className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {menuOpen && (
                <div className="ecn-rise absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-e3" style={{ animationDuration: "0.12s" }}>
                  <div className="border-b border-line px-4 py-2">
                    <p className="truncate text-[13px] font-medium text-ink">{user.name}</p>
                    <p className="truncate text-[11px] text-muted">{user.email}</p>
                  </div>
                  <button onClick={() => { setMenuOpen(false); navigate("/tickets"); }} className="block w-full px-4 py-2.5 text-left text-[14px] text-ink transition-colors hover:bg-surface">{t("header.myTickets")}</button>
                  {dash && <button onClick={() => { setMenuOpen(false); navigate(dash); }} className="block w-full px-4 py-2.5 text-left text-[14px] text-ink transition-colors hover:bg-surface">{t("header.dashboard")}</button>}
                  <button onClick={() => { setMenuOpen(false); logout(); navigate("/"); }} className="block w-full border-t border-line px-4 py-2.5 text-left text-[14px] text-error transition-colors hover:bg-error/5">{t("login.logout")}</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => openLogin()} className={`inline-flex h-9 shrink-0 items-center rounded-xl border px-3 text-[13px] font-semibold transition-colors sm:h-10 sm:px-5 sm:text-[14px] ${v.login}`}>
                {t("header.login")}
              </button>
              <button onClick={() => openLogin(undefined, "register")} className="inline-flex h-9 shrink-0 items-center rounded-xl bg-brand px-3 text-[13px] font-semibold text-white transition-all hover:bg-brand-hover active:scale-95 sm:h-10 sm:px-5 sm:text-[14px]">
                {t("login.signup")}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
