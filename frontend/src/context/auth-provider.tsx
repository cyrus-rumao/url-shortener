import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/services/axios.js";
import { AuthContext } from "./auth-context.js";
import type { LoginPayload, SignupPayload, User } from "@/types/auth.js";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const response = await api.get<{ user: User }>("/auth/me");
        if (!cancelled) {
          setUser(response.data.user);
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
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await api.post<{ user: User }>("/auth/login", payload);
    setUser(response.data.user);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    await api.post("/auth/register", payload);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await api.get<{ user: User }>("/auth/me");
    setUser(response.data.user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshUser }),
    [user, loading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
