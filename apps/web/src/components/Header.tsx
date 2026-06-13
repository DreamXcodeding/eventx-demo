import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openLogin = useUiStore((s) => s.openLogin);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeUserMenu = () => setUserMenuOpen(false);

  const handleLogout = () => {
    closeUserMenu();
    logout();
  };

  return (
    <header className={`border-b border-line bg-white transition-shadow duration-200 ${scrolled ? "shadow-e1" : ""}`}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-6">
        <Link to="/" className="shrink-0 text-2xl font-bold tracking-tight text-ink">
          EventX
        </Link>

        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          {[
            { label: t("nav.events"), href: "#events" },
            { label: t("nav.promo"), href: "#promo" },
            { label: t("nav.reviews"), href: "#faq" },
          ].map((n) => (
            <a key={n.href} href={n.href} className="rounded-md px-3 py-1.5 text-[15px] font-medium text-slate transition-colors hover:bg-surface hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar compact />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                aria-label="เมนูผู้ใช้"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-ink transition-colors hover:bg-raised active:scale-95"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[12px] font-semibold text-white">
                  {(user?.name ?? "?").charAt(0)}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-e2">
                  {user?.role === "AFFILIATE" && (
                    <Link
                      to="/affiliate"
                      onClick={closeUserMenu}
                      className="block px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface"
                    >
                      {t("header.dashboard")}
                    </Link>
                  )}
                  <Link
                    to="/tickets"
                    onClick={closeUserMenu}
                    className="block px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface"
                  >
                    {t("header.myTickets")}
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={closeUserMenu}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface"
                  >
                    <span>{t("header.payment")}</span>
                    {cartCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2.5 text-left text-[14px] font-medium text-error transition-colors hover:bg-surface"
                  >
                    {t("header.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLogin()}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-e1 transition-all hover:bg-brand-hover active:scale-95"
            >
              {t("header.login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
