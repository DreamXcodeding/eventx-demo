// authStore — token + โปรไฟล์ผู้ใช้ + locale (sync กับ Keycloak ภายหลัง)
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "th" | "en";
export type UserRole = "CUSTOMER" | "AGENT" | "AFFILIATE" | "ORGANIZER" | "SPONSOR" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  locale: Locale;
  isAuthenticated: boolean;
  setLocale: (locale: Locale) => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      locale: "th",
      isAuthenticated: false,
      setLocale: (locale) => set({ locale }),
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: "ecn-auth" }
  )
);
