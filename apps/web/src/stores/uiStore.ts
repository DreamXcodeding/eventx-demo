import { create } from "zustand";
import type { Locale } from "./authStore";

export const LOCALE_LABEL: Record<Locale, string> = { th: "TH", en: "EN" };
const ORDER: Locale[] = ["th", "en"];

interface UiState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  cycleLocale: () => void;
  loginOpen: boolean;
  loginRedirect: string | null;
  openLogin: (redirect?: string) => void;
  closeLogin: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  locale: "th",
  setLocale: (locale) => set({ locale }),
  cycleLocale: () => {
    const next = ORDER[(ORDER.indexOf(get().locale) + 1) % ORDER.length];
    set({ locale: next });
  },
  loginOpen: false,
  loginRedirect: null,
  openLogin: (redirect) => set({ loginOpen: true, loginRedirect: redirect ?? null }),
  closeLogin: () => set({ loginOpen: false, loginRedirect: null }),
}));
