import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { ProfileFields, User } from "../api/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    profile?: ProfileFields
  ) => Promise<User>;
  registerJournalist: (form: FormData) => Promise<User>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (
    input: {
      firstName: string;
      lastName: string;
      bio?: string | null;
      specialty?: string | null;
      xUrl?: string | null;
      instagramUrl?: string | null;
      facebookUrl?: string | null;
    } & ProfileFields
  ) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  replaceDegree: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!api.hasRefreshToken()) {
        setLoading(false);
        return;
      }
      try {
        const session = await api.refresh();
        if (!cancelled) {
          setUser(session?.user ?? null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const session = await api.login(email, password);
        setUser(session.user);
      },
      register: async (firstName, lastName, email, password, profile) => {
        const session = await api.register(firstName, lastName, email, password, profile);
        setUser(session.user);
        return session.user;
      },
      registerJournalist: async (form) => {
        const session = await api.registerJournalist(form);
        setUser(session.user);
        return session.user;
      },
      updateProfile: async (input) => {
        const next = await api.updateProfile(input);
        setUser(next);
      },
      updateAvatar: async (file) => {
        const next = await api.updateAvatar(file);
        setUser(next);
      },
      replaceDegree: async (file) => {
        const next = await api.replaceDegree(file);
        setUser(next);
      },
      logout: async () => {
        await api.logout();
        setUser(null);
      },
      changePassword: async (currentPassword, newPassword) => {
        await api.changePassword(currentPassword, newPassword);
        await api.logout();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
