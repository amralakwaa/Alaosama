"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { useRedirectIfAuth } from "@/lib/auth/use-auth-redirect";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  useRedirectIfAuth("/");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      // Role-based redirect
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get("returnUrl");
      if (returnUrl) {
        router.push(returnUrl);
      } else if (loggedUser?.role === "admin") {
        router.push("/admin");
      } else if (loggedUser?.role === "author") {
        router.push("/author");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white font-bold">أ</span>
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)]">أمانات ومكتبة أسامة</span>
          </a>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">مرحباً بعودتك</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">سجّل دخولك للوصول إلى مكتبتك</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="login-email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@amanat.ye"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              }
            />

            <Input
              id="login-password"
              type="password"
              label="كلمة المرور"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />

            {error && (
              <div className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 px-3 py-2 rounded-[var(--radius-md)]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              size="md"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? (
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : null}
              {loading ? "جارٍ التحقق..." : "تسجيل الدخول"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          ليس لديك حساب؟{" "}
          <a href="/register" className="text-[var(--color-accent)] hover:underline font-medium">
            أنشئ حساباً مجانياً
          </a>
        </p>
      </div>
    </div>
  );
}
