"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  notify: (n: Omit<Notification, "id">) => void;
  dismiss: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((n: Omit<Notification, "id">) => {
    const id = `notif-${Date.now()}`;
    setNotifications((prev) => [...prev, { ...n, id }]);
    // Auto-dismiss after 4s
    setTimeout(() => setNotifications((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const colors = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    info: "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };

  return (
    <NotificationsContext.Provider value={{ notifications, notify, dismiss }}>
      {children}

      {/* Toast Stack */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)] border backdrop-blur-md shadow-[var(--shadow-md)] animate-in slide-in-from-left-5 duration-300 ${colors[n.type]}`}
          >
            <span className="text-lg flex-shrink-0">{icons[n.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{n.title}</p>
              {n.message && <p className="text-xs opacity-80 mt-0.5">{n.message}</p>}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="text-lg opacity-60 hover:opacity-100 flex-shrink-0 leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationsProvider");
  return ctx;
}
