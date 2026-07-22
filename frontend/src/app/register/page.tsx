"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { useRedirectIfAuth } from "@/lib/auth/use-auth-redirect";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  useRedirectIfAuth("/");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent)] flex items-center justify-center">
              <span className="text-white font-bold">أ</span>
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-display)]">أمانات ومكتبة أسامة</span>
          </a>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">أنشئ حسابك مجاناً</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">انضم لمجتمع القراء في مكتبة أسامة</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="register-name"
              type="text"
              label="الاسم الكامل"
              placeholder="أحمد محمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                </svg>
              }
            />

            <Input
              id="register-email"
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
              id="register-password"
              type="password"
              label="كلمة المرور"
              placeholder="8 أحرف على الأقل"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />

            <Input
              id="register-confirm-password"
              type="password"
              label="تأكيد كلمة المرور"
              placeholder="أعد كتابة كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={confirmPassword && confirmPassword !== password ? "كلمتا المرور غير متطابقتين" : undefined}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4"/><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
              {loading && (
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب مجاناً"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          لديك حساب بالفعل؟{" "}
          <a href="/login" className="text-[var(--color-accent)] hover:underline font-medium">
            سجّل دخولك
          </a>
        </p>
      </div>
    </div>
  );
}
