"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export default function AuthModal() {
  const { authModal, hideAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (authModal.isOpen) {
      setTab("login");
      setName("");
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [authModal.isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideAuthModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [hideAuthModal]);

  if (!authModal.isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // Execute callback (e.g., follow author) after successful auth
      if (authModal.callback) {
        authModal.callback();
      }
      hideAuthModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) hideAuthModal(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-label={tab === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        className="relative w-full max-w-md bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center border-b border-[var(--border-color)] bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent">
          <button
            onClick={hideAuthModal}
            className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--border-color)] transition-colors text-[var(--text-muted)]"
            aria-label="إغلاق"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">أ</span>
          </div>

          {authModal.message && (
            <p className="text-sm text-[var(--text-muted)] mb-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-2 rounded-lg">
              {authModal.message}
            </p>
          )}

          {/* Tabs */}
          <div role="tablist" className="flex bg-[var(--card-bg)] rounded-[var(--radius-md)] p-1 gap-1 mt-2">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              aria-selected={tab === "login"}
              role="tab"
              className={`flex-1 py-2 text-sm font-bold rounded-[var(--radius-sm)] transition-all ${
                tab === "login"
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              aria-selected={tab === "register"}
              role="tab"
              className={`flex-1 py-2 text-sm font-bold rounded-[var(--radius-sm)] transition-all ${
                tab === "register"
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              حساب جديد
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {tab === "register" && (
            <div>
              <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">الاسم الكامل</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد محمد"
                className="w-full px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@amanat.ye"
              className="w-full px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-[var(--text-muted)]">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={tab === "register" ? 8 : undefined}
              className="w-full px-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-[var(--radius-md)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-accent)] text-white font-bold rounded-[var(--radius-md)] hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            )}
            {loading ? "جاري المعالجة..." : tab === "login" ? "تسجيل الدخول" : "إنشاء الحساب مجاناً"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-5 text-center text-xs text-[var(--text-muted)]">
          {tab === "login" ? (
            <>ليس لديك حساب؟{" "}
              <button onClick={() => setTab("register")} className="text-[var(--color-accent)] font-bold hover:underline">
                أنشئ حساباً مجانياً
              </button>
            </>
          ) : (
            <>لديك حساب بالفعل؟{" "}
              <button onClick={() => setTab("login")} className="text-[var(--color-accent)] font-bold hover:underline">
                سجّل دخولك
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
