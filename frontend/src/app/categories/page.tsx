"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  booksCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/categories/with-counts`)
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
            تصفّح أقسام مكتبة أسامة
          </h1>
          <p className="text-[var(--text-muted)]">
            اكتشف الكتب اليمنية والعربية حسب اهتمامك
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 animate-pulse">
                <div className="w-10 h-10 bg-[var(--border-color)] rounded-full mb-3" />
                <div className="h-4 bg-[var(--border-color)] rounded mb-2 w-3/4" />
                <div className="h-3 bg-[var(--border-color)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/books?categoryId=${cat.id}`}
                className="group bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h2 className="font-bold mb-1 group-hover:text-[var(--color-accent)] transition-colors">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
                    {cat.description}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)]">
                  {cat.booksCount > 0
                    ? `${cat.booksCount} كتاب`
                    : "لا توجد كتب بعد"}
                </p>
              </a>
            ))}
          </div>
        )}

        {/* Popular searches */}
        <div className="mt-12">
          <h2 className="font-bold mb-4 text-[var(--text-muted)] text-sm uppercase tracking-wider">
            أبرز الأقسام
          </h2>
          <div className="flex flex-wrap gap-2">
            {["الأدب اليمني", "الدراسات الإسلامية", "التاريخ والتراث", "تطوير الذات", "الأطفال والناشئة", "الشعر والأدب"].map((tag) => (
              <a
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-full)] text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
