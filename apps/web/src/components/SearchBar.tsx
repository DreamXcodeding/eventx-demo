import { useTranslation } from "react-i18next";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={`flex items-center gap-2 ${
        compact
          ? "rounded-md border border-line bg-surface px-3 py-2"
          : "rounded-lg border border-line bg-white p-2 pl-4 shadow-e2"
      }`}
    >
      <span className="text-muted">⌕</span>
      <input
        type="text"
        placeholder={compact ? t("header.search") : t("header.searchFull")}
        className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
      />
      {compact ? (
        <kbd className="hidden rounded border border-line bg-white px-1.5 py-0.5 text-[11px] text-muted sm:inline">
          ⌘K
        </kbd>
      ) : (
        <button
          type="submit"
          className="rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover active:scale-95"
        >
          {t("header.searchBtn")}
        </button>
      )}
    </form>
  );
}
