import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AGENT } from "../stores/agentStore";
import { useAuthStore } from "../stores/authStore";
import { useUiStore } from "../stores/uiStore";
import CnxFooter from "./CnxFooter";

const NAV = [
  { to: "/agent", key: "agent.dash" },
  { to: "/agent/book", key: "agent.book" },
];

export default function AgentShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const openLogin = useUiStore((s) => s.openLogin);
  const [open, setOpen] = useState(false);
  const displayName = user?.name ?? AGENT.name;
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 bg-navy-hero">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-6 px-6">
          <Link to="/agent" className="flex items-center gap-2 text-white">
            <span className="text-xl font-bold tracking-tight">EventX</span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white">AGENT</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
              const on = n.to === "/agent" ? pathname === "/agent" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${on ? "bg-white/15 text-white" : "text-white/70 hover:text-white"}`}
                >
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>
          <div className="relative ml-auto">
            {isAuth ? (
              <>
                <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[13px] font-medium leading-tight text-white">{displayName}</p>
                    <p className="text-[11px] leading-tight text-white/60">{AGENT.code} · {AGENT.company}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{displayName.charAt(0)}</div>
                </button>
                {open && (
                  <div className="ecn-rise absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-e3" style={{ animationDuration: "0.12s" }}>
                    <div className="border-b border-line px-4 py-2">
                      <p className="truncate text-[13px] font-medium text-ink">{user?.name}</p>
                      <p className="truncate text-[11px] text-muted">{user?.email}</p>
                    </div>
                    <button onClick={() => { setOpen(false); navigate("/tickets"); }} className="block w-full px-4 py-2.5 text-left text-[14px] text-ink transition-colors hover:bg-surface">{t("header.myTickets")}</button>
                    <button onClick={() => { setOpen(false); logout(); navigate("/"); }} className="block w-full border-t border-line px-4 py-2.5 text-left text-[14px] text-error transition-colors hover:bg-error/5">{t("login.logout")}</button>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => openLogin("/agent")} className="rounded-md bg-white/15 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25">{t("header.login")}</button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1100px] px-6 py-8">{children}</main>
      <CnxFooter />
    </div>
  );
}
