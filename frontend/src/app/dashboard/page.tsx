"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRequireAuth } from "@/lib/auth/use-auth-redirect";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ReadingProgress {
  id: number;
  currentPage: number;
  progressPercent: number;
  lastReadAt: string;
  book: {
    id: number;
    title: string;
    slug: string;
    coverImageUrl: string | null;
    pageCount: number | null;
    category: { name: string } | null;
  };
}

interface DashboardData {
  stats: {
    booksStarted: number;
    booksCompleted: number;
    booksInProgress: number;
  };
  recentlyRead: ReadingProgress[];
}

export default function DashboardPage() {
  const { user, accessToken } = useAuth();
  const { isLoading: authLoading } = useRequireAuth("/login");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followedAuthors, setFollowedAuthors] = useState<any[]>([]);
  const [authorReviewStats, setAuthorReviewStats] = useState<any | null>(null);
  const [authorReviews, setAuthorReviews] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    
    const baseRequests = [
      fetch(`${API}/users/me/dashboard`, { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
      fetch(`${API}/authors/followed`, { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json())
    ];

    Promise.all(baseRequests)
    .then(([dashData, authorsData]) => {
      setData(dashData);
      setFollowedAuthors(authorsData || []);
    })
    .finally(() => setLoading(false));

    // Fetch author review stats if user is author or admin
    if (user?.role === 'author' || user?.role === 'admin') {
      Promise.all([
        fetch(`${API}/author/review-stats`, { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
        fetch(`${API}/author/reviews?page=1&limit=5`, { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()),
      ]).then(([stats, reviews]) => {
        setAuthorReviewStats(stats);
        setAuthorReviews(reviews?.data || []);
      }).catch(() => {});
    }
  }, [accessToken]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
    </div>
  );

  const handleUnfollow = async (authorId: number) => {
    if (!accessToken) return;
    try {
      await fetch(`${API}/authors/${authorId}/follow`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setFollowedAuthors(prev => prev.filter(a => a.id !== authorId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!accessToken || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`${API}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      });
      if (res.ok) {
        setReplyingTo(null);
        setReplyText("");
        // Refresh
        const updated = await fetch(`${API}/author/reviews?page=1&limit=5`, { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json());
        setAuthorReviews(updated?.data || []);
      }
    } catch {}
    finally { setReplyLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
            مرحباً، {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">
            لوحة القراءة الخاصة بك
          </p>
        </div>

        {/* Admin Banner — admins only */}
        {user?.role === "admin" && (
          <a
            href="/admin"
            className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 border border-[var(--color-accent)]/40 rounded-[var(--radius-lg)] hover:border-[var(--color-accent)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-accent)] rounded-[var(--radius-md)] flex items-center justify-center text-white text-lg">⚙️</div>
              <div>
                <p className="font-bold text-sm">لوحة الإدارة</p>
                <p className="text-[var(--text-muted)] text-xs">إدارة الكتب والمستخدمين وإحصائيات المنصة</p>
              </div>
            </div>
            <span className="text-[var(--color-accent)] font-bold text-lg group-hover:translate-x-[-4px] transition-transform">←</span>
          </a>
        )}


        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 animate-pulse">
                  <div className="h-8 bg-[var(--border-color)] rounded mb-2 w-1/2" />
                  <div className="h-4 bg-[var(--border-color)] rounded w-2/3" />
                </div>
              ))
            : [
                { label: "كتب بدأتها", value: data?.stats?.booksStarted ?? 0, icon: "📚" },
                { label: "قيد القراءة", value: data?.stats?.booksInProgress ?? 0, icon: "📖" },
                { label: "كتب أتممتها", value: data?.stats?.booksCompleted ?? 0, icon: "✅" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 hover:shadow-[var(--shadow-md)] transition-all"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-[var(--text-muted)] text-sm mt-0.5">{stat.label}</div>
                </div>
              ))}
        </div>

        {/* Recently Read */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[family-name:var(--font-display)]">
              آخر ما قرأت
            </h2>
            <a href="/books" className="text-sm text-[var(--color-accent)] hover:underline">
              تصفح المكتبة ←
            </a>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 flex gap-4 animate-pulse">
                  <div className="w-12 h-16 bg-[var(--border-color)] rounded flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--border-color)] rounded mb-2 w-3/4" />
                    <div className="h-3 bg-[var(--border-color)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.recentlyRead?.length ? (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] border-dashed rounded-[var(--radius-lg)] p-10 text-center">
              <div className="text-5xl mb-3">📖</div>
              <p className="text-[var(--text-muted)] mb-4">لم تبدأ أي كتاب بعد</p>
              <a href="/books">
                <Button variant="accent" size="sm">اكتشف الكتب</Button>
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data?.recentlyRead?.map((progress) => (
                <a
                  key={progress.id}
                  href={`/books/${progress.book.slug}`}
                  className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 flex gap-4 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all"
                >
                  {/* Mini Cover */}
                  <div className="w-12 h-16 flex-shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-primary)]/10 border border-[var(--border-color)]">
                    {progress.book.coverImageUrl ? (
                      <img src={progress.book.coverImageUrl} alt={progress.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl opacity-40">📖</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1">{progress.book.title}</h3>
                    {progress.book.category && (
                      <span className="text-xs text-[var(--text-muted)]">{progress.book.category.name}</span>
                    )}
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
                        <span>الصفحة {progress.currentPage}</span>
                        <span>{Math.round(progress.progressPercent)}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                          style={{ width: `${progress.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Followed Authors */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[family-name:var(--font-display)]">
              المؤلفون الذين تتابعهم
            </h2>
          </div>
          
          {loading ? (
             <div className="flex gap-4 overflow-x-auto pb-4">
               {Array.from({length: 4}).map((_, i) => (
                 <div key={i} className="w-24 h-24 rounded-full bg-[var(--border-color)] animate-pulse shrink-0" />
               ))}
             </div>
          ) : followedAuthors.length === 0 ? (
             <div className="bg-[var(--card-bg)] border border-[var(--border-color)] border-dashed rounded-[var(--radius-lg)] p-8 text-center">
               <p className="text-[var(--text-muted)] text-sm mb-3">أنت لا تتابع أي مؤلف حالياً</p>
               <a href="/authors" className="text-[var(--color-accent)] text-sm font-bold hover:underline">استكشف المؤلفين</a>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {followedAuthors.map((author) => (
                 <div key={author.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 flex gap-4 items-center">
                   <a href={`/authors/${author.id}`} className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center text-2xl overflow-hidden shrink-0 border border-[var(--border-color)]">
                     {author.avatar ? (
                       <img 
                         src={author.avatar.startsWith('http') ? author.avatar : `${API.replace('/api','')}${author.avatar}`} 
                         alt={author.name} 
                         className="w-full h-full object-cover" 
                       />
                     ) : '✍️'}
                   </a>
                   <div className="flex-1 min-w-0">
                     <a href={`/authors/${author.id}`} className="font-bold text-sm hover:text-[var(--color-accent)] transition-colors line-clamp-1">{author.name}</a>
                     <p className="text-xs text-[var(--text-muted)] mt-1">{author.bookCount || 0} مؤلفات</p>
                     {author.latestBookTitle && (
                       <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">آخر إصدار: {author.latestBookTitle}</p>
                     )}
                   </div>
                   <button 
                     onClick={() => handleUnfollow(author.id)}
                     className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors whitespace-nowrap"
                   >
                     إلغاء المتابعة
                   </button>
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* ─── Author Reviews Section ─── */}
        {(user?.role === "author" || user?.role === "admin") && authorReviewStats && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold font-[family-name:var(--font-display)]">
                ⭐ تقييمات كتبي
              </h2>
              <a href="/author/books" className="text-sm text-[var(--color-accent)] hover:underline">
                إدارة الكتب ←
              </a>
            </div>

            {/* Author Review Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "إجمالي التقييمات", value: authorReviewStats.totalReviews, icon: "💬" },
                { label: "متوسط التقييم", value: `${authorReviewStats.averageRating}/5`, icon: "⭐" },
                { label: "ردودي", value: authorReviewStats.totalReplies, icon: "↩️" },
                { label: "أكثر الكتب تفاعلاً", value: authorReviewStats.topBook?.title ? authorReviewStats.topBook.title.substring(0, 15) + (authorReviewStats.topBook.title.length > 15 ? "…" : "") : "—", icon: "🏆" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4"
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold" style={{ color: "var(--color-accent)" }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Reviews */}
            {authorReviews.length === 0 ? (
              <div className="bg-[var(--card-bg)] border border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)] p-8 text-center">
                <div className="text-4xl mb-2 opacity-40">💬</div>
                <p className="text-[var(--text-muted)] text-sm">لا توجد تقييمات على كتبك حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-4">
                {authorReviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden border border-[var(--border-color)]"
                        style={{ background: "color-mix(in srgb, var(--color-accent) 15%, var(--card-bg))", color: "var(--color-accent)" }}
                      >
                        {review.user?.avatar ? (
                          <img src={review.user.avatar.startsWith("http") ? review.user.avatar : `${API.replace("/api", "")}${review.user.avatar}`} alt={review.user.name} className="w-full h-full object-cover" />
                        ) : review.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{review.user?.name}</span>
                          <span className="text-xs text-[var(--text-muted)]">على: {review.book?.title}</span>
                        </div>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                              fill={s <= review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"
                              style={{ color: "var(--color-accent)" }}>
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3 pr-12">
                        {review.comment}
                      </p>
                    )}

                    {/* Existing reply */}
                    {review.replies?.length > 0 && (
                      <div className="mr-4 border-r-2 border-[var(--color-accent)]/30 pr-3 mb-2">
                        <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-accent)" }}>ردك:</p>
                        <p className="text-xs text-[var(--foreground)]">{review.replies[0]?.replyText}</p>
                      </div>
                    )}

                    {/* Reply form */}
                    {review.replies?.length === 0 && (
                      replyingTo === review.id ? (
                        <div className="space-y-2 pr-12">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            placeholder="اكتب ردك..."
                            className="w-full px-3 py-2 text-xs rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--background)] resize-none focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(review.id)}
                              disabled={replyLoading || !replyText.trim()}
                              className="px-3 py-1 text-xs font-semibold text-white rounded-[var(--radius-sm)] disabled:opacity-50"
                              style={{ background: "var(--color-accent)" }}
                            >
                              {replyLoading ? "جاري الإرسال..." : "إرسال"}
                            </button>
                            <button onClick={() => { setReplyingTo(null); setReplyText(""); }}
                              className="px-3 py-1 text-xs border border-[var(--border-color)] rounded-[var(--radius-sm)] hover:bg-[var(--card-bg-hover)] transition-colors">
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReplyingTo(review.id); setReplyText(""); }}
                          className="text-xs font-medium pr-12 transition-colors hover:underline"
                          style={{ color: "var(--color-accent)" }}
                        >
                          ↩ رد على هذه المراجعة
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "تعديل الملف الشخصي", icon: "✏️", href: "/profile" },
            { label: "تصفح المكتبة", icon: "🔍", href: "/books" },
            { label: "انشر كتابك", icon: "📝", href: "/publish" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 text-center hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
