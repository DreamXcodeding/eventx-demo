import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AGENT } from "../stores/agentStore";
import CnxFooter from "./CnxFooter";

const NAV = [
  { to: "/agent", key: "agent.dash" },
  { to: "/agent/book", key: "agent.book" },
];

export default function AgentShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
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
          <div className="ml-auto flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-[13px] font-medium leading-tight text-white">{AGENT.name}</p>
              <p className="text-[11px] leading-tight text-white/60">{AGENT.code} · {AGENT.company}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
              {AGENT.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1100px] px-6 py-8">{children}</main>
      <CnxFooter />
    </div>
  );
}
