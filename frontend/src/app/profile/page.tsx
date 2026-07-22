"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRequireAuth } from "@/lib/auth/use-auth-redirect";
import Navbar from "@/components/layout/Navbar";
import { Button, Input } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function ProfilePage() {
  const { user, accessToken } = useAuth();
  const { isLoading: authLoading } = useRequireAuth("/login");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.avatar || "");
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const res = await fetch(`${API}/users/me/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">الملف الشخصي</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">إدارة بياناتك ومعلوماتك الشخصية</p>
        </div>

        {/* Avatar Placeholder */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-[var(--color-accent)]">
              {user?.name?.[0] || "؟"}
            </span>
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-[var(--text-muted)] text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium
              ${user?.role === "admin" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                user?.role === "author" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
                "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"}`}
            >
              {user?.role === "admin" ? "مشرف" : user?.role === "author" ? "مؤلف" : "قارئ"}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6">
          <h2 className="font-bold mb-5">تعديل البيانات</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="profile-name"
              label="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">
                نبذة شخصية
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="أخبرنا عن اهتماماتك القرائية..."
                className="w-full px-3 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-all resize-none text-sm"
              />
            </div>

            {error && (
              <div className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 px-3 py-2 rounded-[var(--radius-md)]">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-2 rounded-[var(--radius-md)]">
                ✅ تم حفظ التغييرات بنجاح
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="accent" size="md" disabled={saving}>
                {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
              <a href="/dashboard">
                <Button type="button" variant="ghost" size="md">إلغاء</Button>
              </a>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-[var(--card-bg)] border border-[var(--color-error)]/30 rounded-[var(--radius-lg)] p-6">
          <h3 className="font-bold text-[var(--color-error)] mb-2">منطقة الخطر</h3>
          <p className="text-[var(--text-muted)] text-sm mb-4">
            حذف الحساب نهائي ولا يمكن التراجع عنه.
          </p>
          <Button variant="ghost" size="sm" className="border border-[var(--color-error)]/50 text-[var(--color-error)] hover:bg-[var(--color-error)]/10">
            حذف الحساب
          </Button>
        </div>
      </main>
    </div>
  );
}
