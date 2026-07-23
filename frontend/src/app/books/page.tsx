"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BookCard from "@/components/ui/BookCard";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Category { id: number; name: string; slug: string; }

function BooksContent() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoryId") || "all";
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [filterType, setFilterType] = useState("all"); // all | free | premium
  const [sortBy, setSortBy] = useState("recent"); // recent | downloads | views
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (selectedCat !== "all") params.set("categoryId", selectedCat);
    if (filterType === "free") params.set("isPremium", "false");
    if (filterType === "premium") params.set("isPremium", "true");
    if (sortBy === "downloads") params.set("sort", "downloads");
    if (sortBy === "views") params.set("sort", "views");

    fetch(`${API}/books?${params}`)
      .then(r => r.json())
      .then(data => {
        const newBooks = data.data || [];
        if (page === 1) {
          setBooks(newBooks);
        } else {
          setBooks(prev => [...prev, ...newBooks]);
        }
        setMeta(data.meta || { page: 1, total: 0, totalPages: 0 });
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [selectedCat, filterType, sortBy, page]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setPage(p => p + 1);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070B09]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        {/* Page Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-[#2D6A4F]/5 blur-3xl -z-10 h-full w-full rounded-full" />
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-[1px] bg-[#2D6A4F]"></div>
            <span className="text-[#2D6A4F] text-[12px] font-bold tracking-[0.1em] uppercase font-display">عالم المعرفة</span>
            <div className="w-10 h-[1px] bg-[#2D6A4F]"></div>
          </div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-display font-black text-[#0A0806] dark:text-[#F5F0E8] leading-tight mb-4">
            المكتبة <span className="font-serif italic text-[#2D6A4F] font-medium">الرقمية</span>
          </h1>
          <p className="text-[#7A6548] dark:text-[#A08B6B] max-w-2xl mx-auto text-lg leading-relaxed">
            {meta.total > 0 ? `تصفح ${meta.total.toLocaleString("ar")} كتاب متاح في مختلف المجالات.` : "جاري تحميل الكتب..."}
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-[#E2EFE7] dark:border-[#152B20]">
          {/* Categories */}
          <div role="group" aria-label="تصنيفات الكتب" className="flex gap-2 flex-wrap w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => { setSelectedCat("all"); setPage(1); }}
              className={`px-5 py-2.5 text-[13px] rounded-full font-display font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCat === "all"
                  ? "bg-[#2D6A4F] text-white shadow-[0_4px_12px_rgba(45,106,79,0.2)]"
                  : "bg-white dark:bg-[#14120E] border border-[#E2EFE7] dark:border-[#152B20] text-[#7A6548] dark:text-[#A08B6B] hover:text-[#2D6A4F] hover:border-[#2D6A4F]/30"
              }`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCat(String(cat.id)); setPage(1); }}
                className={`px-5 py-2.5 text-[13px] rounded-full font-display font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCat === String(cat.id)
                    ? "bg-[#2D6A4F] text-white shadow-[0_4px_12px_rgba(45,106,79,0.2)]"
                    : "bg-white dark:bg-[#14120E] border border-[#E2EFE7] dark:border-[#152B20] text-[#7A6548] dark:text-[#A08B6B] hover:text-[#2D6A4F] hover:border-[#2D6A4F]/30"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right-side filters */}
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setPage(1); }}
              aria-label="نوع الكتاب"
              className="text-[13px] bg-white dark:bg-[#14120E] border border-[#E2EFE7] dark:border-[#152B20] text-[#0A0806] dark:text-[#F5F0E8] rounded-full px-5 py-2.5 font-display font-bold cursor-pointer hover:border-[#2D6A4F]/50 outline-none transition-colors"
            >
              <option value="all">كل الكتب</option>
              <option value="free">مجاني</option>
              <option value="premium">مدفوع</option>
            </select>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              aria-label="ترتيب حسب"
              className="text-[13px] bg-white dark:bg-[#14120E] border border-[#E2EFE7] dark:border-[#152B20] text-[#0A0806] dark:text-[#F5F0E8] rounded-full px-5 py-2.5 font-display font-bold cursor-pointer hover:border-[#2D6A4F]/50 outline-none transition-colors"
            >
              <option value="recent">الأحدث</option>
              <option value="downloads">الأكثر تحميلاً</option>
              <option value="views">الأكثر مشاهدة</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[400px] rounded-[24px] bg-[#E2EFE7]/50 dark:bg-[#0E2018]/50 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-28 bg-white dark:bg-[#14120E] border border-dashed border-[#F0EBE1] dark:border-[#2A241A] rounded-[24px]">
            <div className="text-6xl mb-4 opacity-50">📚</div>
            <h2 className="text-xl font-display font-bold text-[#7A6548] dark:text-[#A08B6B] mb-2">لا توجد كتب في هذا التصنيف</h2>
            <p className="text-[#A08B6B] dark:text-[#7A6548]">
              جرّب تصنيفاً آخر أو{" "}
              <button onClick={() => { setSelectedCat("all"); setFilterType("all"); }}
                className="text-[#2D6A4F] hover:underline font-bold">
                عرض الكل
              </button>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {books.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Load More Button */}
            {meta.page < meta.totalPages && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#2D6A4F] text-white rounded-full font-display font-bold text-[15px] hover:bg-[#1B3D2C] transition-all duration-300 shadow-[0_8px_24px_rgba(45,106,79,0.2)] hover:shadow-[0_12px_32px_rgba(45,106,79,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'جاري التحميل...' : 'عرض المزيد من الكتب'}
                  {!loadingMore && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-1"><path d="M6 9l6 6 6-6"/></svg>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">جاري التحميل...</div>}>
      <BooksContent />
    </Suspense>
  );
}
