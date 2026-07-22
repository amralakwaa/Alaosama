"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ReviewUser {
  id: number;
  name: string;
  email?: string;
  avatar: string | null;
}

interface ReviewReply {
  id: number;
  replyText: string;
  createdAt: string;
  author: ReviewUser & { role: string };
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  status: "approved" | "hidden" | "pending";
  createdAt: string;
  user: ReviewUser;
  book: { id: number; title: string; slug: string };
  replies: ReviewReply[];
}

interface ReviewsData {
  data: Review[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ReviewStats {
  total: number;
  approved: number;
  hidden: number;
  pending: number;
  averageRating: number;
}

const STATUS_LABELS: Record<string, string> = {
  approved: "معتمد",
  hidden: "مخفي",
  pending: "قيد المراجعة",
};
const STATUS_COLORS: Record<string, string> = {
  approved: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
  hidden: "text-red-500 bg-red-50 dark:bg-red-500/10",
  pending: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={s <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: "var(--color-accent)" }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-YE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminReviewsPage() {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  
  // Reply states
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);

      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/reviews?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${API}/admin/reviews/stats`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);

      setReviews(await reviewsRes.json());
      setStats(await statsRes.json());
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const updateStatus = async (reviewId: number, status: string) => {
    setActionLoading(reviewId);
    try {
      const res = await fetch(`${API}/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showFeedback("success", `تم تغيير حالة التقييم إلى: ${STATUS_LABELS[status]}`);
        fetchData();
      } else throw new Error();
    } catch {
      showFeedback("error", "حدث خطأ أثناء تحديث الحالة");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم نهائياً؟")) return;
    setActionLoading(reviewId);
    try {
      const res = await fetch(`${API}/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        showFeedback("success", "تم حذف التقييم بنجاح");
        fetchData();
      } else throw new Error();
    } catch {
      showFeedback("error", "حدث خطأ أثناء الحذف");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReply = async (replyId: number) => {
    if (!confirm("هل تريد حذف هذا الرد؟")) return;
    try {
      const res = await fetch(`${API}/admin/review-replies/${replyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        showFeedback("success", "تم حذف الرد");
        fetchData();
      }
    } catch {
      /* silent */
    }
  };

  const toggleReplies = (reviewId: number) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
      return next;
    });
  };

  const handleReplySubmit = async (reviewId: number) => {
    if (!accessToken || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch(`${API}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ replyText }),
      });
      if (res.ok) {
        showFeedback("success", "تم إضافة الرد بنجاح");
        setReplyingTo(null);
        setReplyText("");
        setExpandedReplies(prev => new Set(prev).add(reviewId));
        fetchData();
      } else {
        throw new Error();
      }
    } catch {
      showFeedback("error", "حدث خطأ أثناء إضافة الرد");
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          إدارة التقييمات والمراجعات
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          مراقبة والتحكم بجميع تقييمات الكتب على المنصة
        </p>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {feedback.type === "success" ? "✅" : "❌"} {feedback.msg}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "إجمالي التقييمات", value: stats.total, icon: "⭐" },
            { label: "معتمدة", value: stats.approved, icon: "✅", color: "text-emerald-500" },
            { label: "مخفية", value: stats.hidden, icon: "🙈", color: "text-red-500" },
            { label: "قيد المراجعة", value: stats.pending, icon: "⏳", color: "text-amber-500" },
            { label: "متوسط التقييم", value: `${stats.averageRating}/5`, icon: "📊" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4"
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color || ""}`}>{s.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { value: "", label: "الكل" },
          { value: "approved", label: "معتمدة" },
          { value: "hidden", label: "مخفية" },
          { value: "pending", label: "قيد المراجعة" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all border ${
              statusFilter === f.value
                ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                : "border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--color-accent)]/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--border-color)] rounded-[var(--radius-md)] animate-pulse" />
          ))}
        </div>
      ) : !reviews?.data.length ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <div className="text-5xl mb-3 opacity-30">💬</div>
          <p>لا توجد تقييمات بهذه الفلترة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.data.map((review) => (
            <div
              key={review.id}
              className="bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5 transition-all"
              style={
                review.status === "hidden"
                  ? { opacity: 0.65, borderStyle: "dashed" }
                  : {}
              }
            >
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-start gap-3 mb-3">
                {/* User info */}
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold overflow-hidden border border-[var(--border-color)]"
                    style={{
                      background: "color-mix(in srgb, var(--color-accent) 15%, var(--card-bg))",
                      color: "var(--color-accent)",
                    }}
                  >
                    {review.user.avatar ? (
                      <img
                        src={
                          review.user.avatar.startsWith("http")
                            ? review.user.avatar
                            : `${API.replace("/api", "")}${review.user.avatar}`
                        }
                        alt={review.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.user.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      <a
                        href={`/books/${review.book.slug}`}
                        target="_blank"
                        className="hover:text-[var(--color-accent)] transition-colors"
                      >
                        📚 {review.book.title}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Rating + date + status */}
                <div className="flex flex-wrap items-center gap-2">
                  <StarDisplay rating={review.rating} />
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[review.status]}`}
                  >
                    {STATUS_LABELS[review.status]}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3 bg-[var(--card-bg)] rounded-[var(--radius-md)] p-3">
                  {review.comment}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 items-center">
                {review.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(review.id, "approved")}
                    disabled={actionLoading === review.id}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 rounded-[var(--radius-sm)] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  >
                    ✅ اعتماد
                  </button>
                )}
                {review.status !== "hidden" && (
                  <button
                    onClick={() => updateStatus(review.id, "hidden")}
                    disabled={actionLoading === review.id}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-600 border border-amber-200 rounded-[var(--radius-sm)] hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                  >
                    🙈 إخفاء
                  </button>
                )}
                <button
                  onClick={() => deleteReview(review.id)}
                  disabled={actionLoading === review.id}
                  className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-[var(--radius-sm)] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  🗑️ حذف
                </button>

                {review.replies.length > 0 && (
                  <button
                    onClick={() => toggleReplies(review.id)}
                    className="px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] rounded-[var(--radius-sm)] hover:bg-[var(--card-bg-hover)] transition-colors mr-auto"
                  >
                    {expandedReplies.has(review.id) ? "▲ إخفاء الردود" : `▼ الردود (${review.replies.length})`}
                  </button>
                )}
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === review.id ? null : review.id);
                    setReplyText("");
                  }}
                  className="px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] rounded-[var(--radius-sm)] hover:bg-[var(--card-bg-hover)] transition-colors mr-auto text-[var(--color-accent)]"
                >
                  ↩ إضافة رد
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === review.id && (
                <div className="mt-3 space-y-2 mr-4 pr-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder="اكتب رد الإدارة على هذه المراجعة..."
                    className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--background)] resize-none focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReplySubmit(review.id)}
                      disabled={replySubmitting || !replyText.trim()}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded-[var(--radius-sm)] disabled:opacity-50"
                      style={{ background: "var(--color-accent)" }}
                    >
                      {replySubmitting ? "جاري الإرسال..." : "إرسال الرد"}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="px-4 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] border border-[var(--border-color)] hover:bg-[var(--card-bg-hover)] transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {expandedReplies.has(review.id) && review.replies.length > 0 && (
                <div className="mt-3 space-y-2 mr-4 border-r-2 border-[var(--color-accent)]/30 pr-4">
                  {review.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex items-start gap-2 p-3 rounded-[var(--radius-md)]"
                      style={{
                        background: "color-mix(in srgb, var(--color-accent) 5%, var(--card-bg))",
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold">{reply.author.name}</span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                              color: "var(--color-accent)",
                            }}
                          >
                            {reply.author.role === "admin" ? "مشرف" : "مؤلف"}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] mr-auto">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground)]">{reply.replyText}</p>
                      </div>
                      <button
                        onClick={() => deleteReply(reply.id)}
                        className="text-red-400 hover:text-red-600 transition-colors text-xs flex-shrink-0"
                        title="حذف الرد"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {reviews && reviews.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-[var(--border-color)] rounded-[var(--radius-md)] hover:bg-[var(--card-bg-hover)] disabled:opacity-50 transition-colors"
          >
            ← السابق
          </button>
          <span className="px-4 py-2 text-sm text-[var(--text-muted)]">
            {page} / {reviews.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(reviews.meta.totalPages, p + 1))}
            disabled={page === reviews.meta.totalPages}
            className="px-4 py-2 text-sm border border-[var(--border-color)] rounded-[var(--radius-md)] hover:bg-[var(--card-bg-hover)] disabled:opacity-50 transition-colors"
          >
            التالي →
          </button>
        </div>
      )}
    </div>
  );
}
