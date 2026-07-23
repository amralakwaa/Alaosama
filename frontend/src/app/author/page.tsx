"use client";

import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AuthorDashboardPage() {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState({
    publishedBooks: 0,
    followers: 0,
    totalDownloads: 0,
    pendingReview: 0,
  });

  useEffect(() => {
    if (accessToken) {
      fetch(`${API}/authors/me/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error);
    }
  }, [accessToken]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">أهلاً بك، أ. {user?.name.split(' ')[0]}</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">ملخص نشاطك في منصة أمانات ومكتبة أسامة</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[var(--background)] border border-[var(--border-color)] p-5 rounded-[var(--radius-lg)] flex flex-col">
          <span className="text-3xl mb-2">📚</span>
          <span className="text-2xl font-black">{stats.publishedBooks}</span>
          <span className="text-sm text-[var(--text-muted)] font-medium">كتب منشورة</span>
        </div>
        <div className="bg-[var(--background)] border border-[var(--border-color)] p-5 rounded-[var(--radius-lg)] flex flex-col">
          <span className="text-3xl mb-2">👥</span>
          <span className="text-2xl font-black">{stats.followers}</span>
          <span className="text-sm text-[var(--text-muted)] font-medium">المتابعون</span>
        </div>
        <div className="bg-[var(--background)] border border-[var(--border-color)] p-5 rounded-[var(--radius-lg)] flex flex-col">
          <span className="text-3xl mb-2">⬇️</span>
          <span className="text-2xl font-black">{stats.totalDownloads}</span>
          <span className="text-sm text-[var(--text-muted)] font-medium">إجمالي التحميلات</span>
        </div>
        <div className="bg-[var(--background)] border border-[var(--border-color)] p-5 rounded-[var(--radius-lg)] flex flex-col">
          <span className="text-3xl mb-2">⏳</span>
          <span className="text-2xl font-black">{stats.pendingReview}</span>
          <span className="text-sm text-[var(--text-muted)] font-medium">قيد المراجعة</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] rounded-[var(--radius-xl)] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div>
          <h2 className="text-2xl font-black font-[family-name:var(--font-display)] mb-2">هل لديك مخطوطة جديدة؟</h2>
          <p className="text-white/80 text-sm max-w-md">
            نحن نساعدك في دار أسامة للنشر على إصدار وتوزيع كتابك عبر المنصة ورقياً ورقمياً بخطوات بسيطة.
          </p>
        </div>
        <Link href="/author/books/new">
          <Button variant="ghost" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-[var(--color-accent)] font-bold px-8">
            رفع كتاب جديد
          </Button>
        </Link>
      </div>
    </div>
  );
}
