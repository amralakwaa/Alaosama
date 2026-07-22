"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type SettingsMap = Record<string, string>;

interface SettingsContextType {
  settings: SettingsMap;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  loading: true,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API}/settings?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data || {});
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
