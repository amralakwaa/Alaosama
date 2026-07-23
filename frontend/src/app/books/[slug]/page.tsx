"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import ReviewsSection from "@/components/ui/ReviewsSection";
import { useAuth } from "@/lib/auth/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Book {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  downloadCount: number;
  viewCount: number;
  pageCount: number | null;
  publishYear: number | null;
  publisher: string | null;
  language: string;
  isPremium: boolean;
  averageRating: number;
  reviewsCount: number;
  author: { id: number; name: string } | null;
  category: { id: number; name: string; slug: string } | null;
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js 15+ requires React.use() to unwrap params Promise
  const { slug } = use(params);

  const { accessToken } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    // Fetch Book
    fetch(`${API}/books/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setBook(data);
          if (accessToken) {
            fetch(`${API}/users/me/favorites/${data.id}`, { headers: { Authorization: `Bearer ${accessToken}` } })
              .then(r => r.json())
              .then(d => setIsFavorited(d.favorited || false))
              .catch(() => {});
          }
        }
      })
      .finally(() => setLoading(false));
      
    // Fetch Similar
    fetch(`${API}/books/${slug}/similar`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (data && Array.isArray(data)) setSimilarBooks(data);
      })
      .catch(() => {});
  }, [slug, accessToken]);

  const handleToggleFavorite = async () => {
    if (!accessToken || !book) {
      window.location.href = '/login';
      return;
    }
    setFavoriteLoading(true);
    try {
      const res = await fetch(`${API}/users/me/favorites/${book.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.favorited);
      }
    } catch {}
    finally { setFavoriteLoading(false); }
  };

  const handleDownload = async () => {
    if (!book) return;
    setDownloading(true);
    setDownloadError("");

    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const res = await fetch(`${API}/books/${book.id}/download-url`, {
        headers
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'فشل تحميل الكتاب');
      }
      
      const data = await res.json();
      
      // Use hidden anchor tag to trigger download (avoids popup blockers)
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setDownloadError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );

  if (notFound || !book)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">📚</span>
        <h1 className="text-2xl font-bold">الكتاب غير موجود</h1>
        <a href="/books">
          <Button variant="accent">العودة للمكتبة</Button>
        </a>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Canonical URL */}
      <link rel="canonical" href={`https://amanat.ye/books/${book.slug}`} />

      {/* Book JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          "name": book.title,
          "author": book.author ? { "@type": "Person", "name": book.author.name } : undefined,
          "description": book.description || undefined,
          "image": book.coverImageUrl ? {
            "@type": "ImageObject",
            "url": book.coverImageUrl.startsWith("http") ? book.coverImageUrl : `https://amanat.ye${book.coverImageUrl}`,
            "width": "800",
            "height": "1200"
          } : undefined,
          "datePublished": book.publishYear ? String(book.publishYear) : undefined,
          "publisher": book.publisher ? { "@type": "Organization", "name": book.publisher } : { "@type": "Organization", "name": "مؤسسة أمانات ومكتبة أسامة" },
          "inLanguage": book.language || "ar",
          "numberOfPages": book.pageCount || undefined,
          "aggregateRating": book.reviewsCount > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": book.averageRating,
            "ratingCount": book.reviewsCount,
            "bestRating": 5,
            "worstRating": 1
          } : undefined,
          "url": `https://amanat.ye/books/${book.slug}`,
        })}}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <a
            href="/books"
            className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            المكتبة
          </a>
          <span className="text-[var(--border-color)]">/</span>
          <span className="text-sm text-[var(--text-muted)] truncate max-w-xs">
            {book.title}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Cover */}
          <div className="flex-shrink-0 w-full md:w-56">
            <div className="aspect-[2/3] rounded-[var(--radius-lg)] overflow-hidden bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 border border-[var(--border-color)] shadow-[var(--shadow-md)] relative">
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={`غلاف كتاب ${book.title} - تأليف ${book.author?.name || 'غير معروف'}`}
                  title={book.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 224px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
                  📖
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            {book.category && (
              <a
                href={`/books?categoryId=${book.category.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium mb-4 hover:bg-[var(--color-accent)]/20 transition-colors"
              >
                {book.category.name}
              </a>
            )}

            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-3 leading-tight">
              {book.title}
            </h1>

            {book.author && (
              <p className="text-[var(--text-muted)] mb-6">
                بقلم{" "}
                <span className="text-[var(--foreground)] font-medium">
                  {book.author.name}
                </span>
              </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-6 text-sm">
              {[
                {
                  label: "مشاهدة",
                  value: book.viewCount.toLocaleString("ar"),
                },
                {
                  label: "تحميل",
                  value: book.downloadCount.toLocaleString("ar"),
                },
                book.reviewsCount > 0
                  ? {
                      label: "تقييم",
                      value: (
                        <div className="flex items-center gap-1 justify-center">
                          <span className="font-bold">{book.averageRating?.toFixed ? book.averageRating.toFixed(1) : book.averageRating}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--color-accent)" }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </div>
                      )
                    }
                  : null,
                book.pageCount
                  ? {
                      label: "صفحة",
                      value: book.pageCount.toLocaleString("ar"),
                    }
                  : null,
                book.publishYear
                  ? { label: "سنة النشر", value: book.publishYear.toString() }
                  : null,
              ]
                .filter(Boolean)
                .map((stat) => (
                  <div key={stat!.label} className="text-center">
                    <div className="text-[var(--foreground)]">
                      {stat!.value}
                    </div>
                    <div className="text-[var(--text-muted)] text-xs mt-0.5">
                      {stat!.label}
                    </div>
                  </div>
                ))}
            </div>

            {book.description && (
              <p className="text-[var(--text-muted)] leading-relaxed mb-8 max-w-lg">
                {book.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <a href={`/books/${book.slug}/read`}>
                <Button variant="accent" size="lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  ابدأ القراءة
                </Button>
              </a>
              <Button variant="ghost" size="lg" onClick={handleToggleFavorite} disabled={favoriteLoading}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isFavorited ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                  style={{ color: isFavorited ? "var(--color-accent)" : "currentColor" }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {isFavorited ? "في المفضلة" : "إضافة للمفضلة"}
              </Button>
              <div>
                <Button variant="ghost" size="lg" onClick={handleDownload} disabled={downloading}>
                  {downloading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                  )}
                  {book.isPremium ? "تحميل (للمشتركين)" : "تحميل PDF"}
                </Button>
                {downloadError && <p className="text-red-500 text-xs mt-2">{downloadError}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Books & Reviews */}
        <div className="mt-16 pt-12 border-t border-[var(--border-color)]">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Reviews */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6">التقييمات والمراجعات</h2>
              <ReviewsSection bookId={book.id} />
            </div>

            {/* Similar */}
            <div>
              <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-6">كتب مشابهة</h2>
              <div className="flex flex-col gap-4">
                {similarBooks.length > 0 ? similarBooks.filter(b => b.id !== book.id).slice(0,3).map(sb => (
                  <a key={sb.id} href={`/books/${sb.slug}`} className="flex gap-4 group">
                    <div className="w-16 h-24 shrink-0 rounded-md overflow-hidden bg-[var(--border-color)] relative">
                      {sb.coverImageUrl ? (
                        <Image
                          src={sb.coverImageUrl}
                          alt={`غلاف ${sb.title}`}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">{sb.title}</h3>
                      {sb.author && <p className="text-xs text-[var(--text-muted)] mt-1">{sb.author.name}</p>}
                    </div>
                  </a>
                )) : (
                  <p className="text-sm text-[var(--text-muted)]">لا يوجد اقتراحات حالياً</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
