"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Book {
  id: number;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  downloadCount: number;
  isPremium: boolean;
  author: { name: string } | null;
  category: { name: string } | null;
}

interface SearchMeta {
  total: number;
  query: string;
  page: number;
  totalPages: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Book[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(query);

  const doSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      setLoading(true);
      fetch(`${API}/books/search?q=${encodeURIComponent(q)}&limit=24`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data.data);
          setMeta(data.meta);
        })
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    setInput(query);
    doSearch(query);
  }, [query, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ابحث عن كتاب، مؤلف، أو موضوع..."
              aria-label="ابحث عن كتاب، مؤلف، أو موضوع"
              className="w-full pr-12 pl-4 py-3.5 text-base bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none transition-all"
              autoFocus
            />
          </div>
        </form>

        {/* Results header */}
        {meta && (
          <div className="mb-6">
            <h1 className="text-lg font-bold font-[family-name:var(--font-display)]">
              {loading ? "جارٍ البحث..." : meta.total === 0
                ? `لا توجد نتائج لـ "${meta.query}"`
                : `${meta.total} نتيجة لـ "${meta.query}"`}
            </h1>
          </div>
        )}

        {!query && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-[var(--text-muted)]">ابدأ بكتابة عنوان كتاب أو اسم مؤلف</p>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-[var(--border-color)] rounded-[var(--radius-md)] mb-3" />
                <div className="h-4 bg-[var(--border-color)] rounded mb-2" />
                <div className="h-3 bg-[var(--border-color)] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {results.map((book) => (
              <a key={book.id} href={`/books/${book.slug}`} className="group">
                <div className="aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 border border-[var(--border-color)] mb-3 relative group-hover:shadow-[var(--shadow-md)] group-hover:-translate-y-1 transition-all duration-300">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📖</div>
                  )}
                  {book.isPremium && (
                    <span className="absolute top-2 right-2 bg-[var(--color-ai-highlight)] text-white text-xs px-2 py-0.5 rounded-full">PLUS</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-[var(--color-accent)] transition-colors">{book.title}</h3>
                {book.author && <p className="text-xs text-[var(--text-muted)]">{book.author.name}</p>}
              </a>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-[var(--text-muted)] mb-2">لم نجد ما تبحث عنه</p>
            <p className="text-sm text-[var(--text-muted)]">جرّب كلمات مختلفة أو تصفّح الأقسام</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
