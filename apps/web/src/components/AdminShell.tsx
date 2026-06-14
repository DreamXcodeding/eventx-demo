import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CnxFooter from "./CnxFooter";

const NAV = [
  { to: "/admin", key: "admin.dash" },
  { to: "/admin/events", key: "admin.events" },
  { to: "/admin/organizers", key: "admin.organizers" },
  { to: "/admin/users", key: "admin.users" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 bg-navy-hero">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-6 px-6">
          <Link to="/admin" className="flex items-center gap-2 text-white">
            <span className="text-xl font-bold tracking-tight">EventX</span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white">ADMIN</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
              const on = n.to === "/admin" ? pathname === "/admin" : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${on ? "bg-white/15 text-white" : "text-white/70 hover:text-white"}`}>
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-medium leading-tight text-white">{t("admin.role")}</p>
              <p className="text-[11px] leading-tight text-white/60">EventX Admin</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">A</div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1100px] px-6 py-8">{children}</main>
      <CnxFooter />
    </div>
  );
}
