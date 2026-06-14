import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AFFILIATE } from "../data/affiliate";
import CnxFooter from "./CnxFooter";

const NAV = [
  { to: "/affiliate", key: "aff.dash" },
  { to: "/affiliate/links", key: "aff.links" },
];

export default function AffiliateShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 bg-navy-hero">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-6 px-6">
          <Link to="/affiliate" className="flex items-center gap-2 text-white">
            <span className="text-xl font-bold tracking-tight">EventX</span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white">AFFILIATE</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
              const on = n.to === "/affiliate" ? pathname === "/affiliate" : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${on ? "bg-white/15 text-white" : "text-white/70 hover:text-white"}`}>
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-medium leading-tight text-white">{AFFILIATE.name}</p>
              <p className="text-[11px] leading-tight text-white/60">{AFFILIATE.code} · {t("aff.rateLabel")} {(AFFILIATE.rateBps / 100).toFixed(0)}%</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{AFFILIATE.name.charAt(0)}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1100px] px-6 py-8">{children}</main>
      <CnxFooter />
    </div>
  );
}
