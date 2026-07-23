"use client";

import {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "author" | "admin";
  avatar: string | null;
}

interface AuthModalState {
  isOpen: boolean;
  callback?: () => void;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  authModal: AuthModalState;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  showAuthModal: (callback?: () => void, message?: string) => void;
  hideAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModal, setAuthModal] = useState<AuthModalState>({ isOpen: false });

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("amanat_access_token");
    if (token) {
      setAccessToken(token);
      fetchMe(token).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async (token: string) => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Invalid token");
      const data = await res.json();
      setUser(data);
    } catch {
      // Token expired or invalid — clear session
      localStorage.removeItem("amanat_access_token");
      localStorage.removeItem("amanat_refresh_token");
      setAccessToken(null);
      setUser(null);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "فشل تسجيل الدخول");
    }

    const data = await res.json();
    localStorage.setItem("amanat_access_token", data.accessToken);
    localStorage.setItem("amanat_refresh_token", data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user; // Return user so callers can use role
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<User> => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "فشل إنشاء الحساب");
    }

    const data = await res.json();
    localStorage.setItem("amanat_access_token", data.accessToken);
    localStorage.setItem("amanat_refresh_token", data.refreshToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("amanat_access_token");
    localStorage.removeItem("amanat_refresh_token");
    setAccessToken(null);
    setUser(null);
  }, []);

  const showAuthModal = useCallback((callback?: () => void, message?: string) => {
    setAuthModal({ isOpen: true, callback, message });
  }, []);

  const hideAuthModal = useCallback(() => {
    setAuthModal({ isOpen: false });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, accessToken, isLoading, authModal,
      login, register, logout, showAuthModal, hideAuthModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
