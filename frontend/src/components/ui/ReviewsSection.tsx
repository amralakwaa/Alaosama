"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ReviewUser {
  id: number;
  name: string;
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
  status: string;
  createdAt: string;
  user: ReviewUser;
  replies: ReviewReply[];
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  counts: Record<number, number>;
}

interface ReviewsData {
  stats: ReviewStats;
  reviews: Review[];
}

interface Props {
  bookId: number;
}

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : half ? "url(#half)" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      style={{ color: "var(--color-accent)" }}
    >
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div
      className="flex gap-0.5"
      style={{ cursor: readOnly ? "default" : "pointer" }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className="transition-transform hover:scale-110 disabled:pointer-events-none"
          style={{ color: "var(--color-accent)", background: "none", border: "none", padding: 0 }}
          aria-label={`${star} نجوم`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={(hover || value) >= star ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-YE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const RATING_LABELS: Record<number, string> = {
  1: "ضعيف",
  2: "مقبول",
  3: "جيد",
  4: "ممتاز",
  5: "رائع",
};

export default function ReviewsSection({ bookId }: Props) {
  const { user, accessToken } = useAuth();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<Review | null>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/books/${bookId}/reviews`);
      const json = await res.json();
      setData(json);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  const fetchMyReview = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API}/books/${bookId}/my-review`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const rev = await res.json();
        if (rev) {
          setMyReview(rev);
          setRating(rev.rating);
          setComment(rev.comment || "");
        }
      }
    } catch {
      /* silent */
    }
  }, [bookId, accessToken]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchMyReview();
  }, [fetchMyReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || rating === 0) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API}/books/${bookId}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "حدث خطأ");
      }
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      await Promise.all([fetchReviews(), fetchMyReview()]);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!accessToken || !myReview) return;
    if (!confirm("هل تريد حذف تقييمك؟")) return;
    try {
      await fetch(`${API}/reviews/${myReview.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMyReview(null);
      setRating(0);
      setComment("");
      await fetchReviews();
    } catch {
      /* silent */
    }
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
        setReplyingTo(null);
        setReplyText("");
        await fetchReviews();
      }
    } catch {
      /* silent */
    } finally {
      setReplySubmitting(false);
    }
  };

  const canReply = user?.role === "author" || user?.role === "admin";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-[var(--border-color)] rounded-[var(--radius-lg)]" />
        <div className="h-24 bg-[var(--border-color)] rounded-[var(--radius-lg)]" />
        <div className="h-24 bg-[var(--border-color)] rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  const stats = data?.stats;
  const reviews = data?.reviews || [];

  return (
    <div className="space-y-8">
      {/* ─── Stats Summary Card ─── */}
      {stats && (
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--card-bg) 0%, color-mix(in srgb, var(--color-accent) 5%, var(--card-bg)) 100%)",
          }}
        >
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Big Average */}
            <div className="text-center flex-shrink-0">
              <div
                className="text-6xl font-black"
                style={{ color: "var(--color-accent)" }}
              >
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={s <= Math.round(stats.averageRating) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                {stats.totalReviews} تقييم
              </div>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)] w-4 text-left">{star}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: "var(--color-accent)", flexShrink: 0 }}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <div className="flex-1 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${stats.distribution[star] || 0}%`,
                        background: "var(--color-accent)",
                        opacity: 0.7 + (star / 10),
                      }}
                    />
                  </div>
                  <span className="text-[var(--text-muted)] w-10 text-right text-xs">
                    {stats.distribution[star] || 0}%
                  </span>
                  <span className="text-[var(--text-muted)] w-8 text-right text-xs">
                    ({stats.counts[star] || 0})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Review Form ─── */}
      {user ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
          <h3 className="font-bold text-base mb-4">
            {myReview ? "✏️ تعديل تقييمك" : "✍️ أضف تقييمك"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star selector */}
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-2">
                تقييمك
              </label>
              <div className="flex items-center gap-3">
                <StarRating value={rating} onChange={setRating} size={28} />
                {rating > 0 && (
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {RATING_LABELS[rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm text-[var(--text-muted)] block mb-2">
                مراجعتك (اختياري)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="شاركنا رأيك في هذا الكتاب..."
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--background)] text-sm resize-none focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
              <div className="text-xs text-[var(--text-muted)] text-left mt-1">
                {comment.length}/1000
              </div>
            </div>

            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}
            {submitSuccess && (
              <p className="text-emerald-500 text-sm font-medium">
                ✅ تم حفظ تقييمك بنجاح!
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="px-6 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-accent)" }}
              >
                {submitting ? "جاري الحفظ..." : myReview ? "تحديث التقييم" : "إرسال التقييم"}
              </button>

              {myReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  حذف تقييمي
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-color)] bg-[var(--card-bg)] p-8 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-[var(--text-muted)] mb-4">
            سجّل دخولك لتتمكن من تقييم هذا الكتاب ومشاركة رأيك
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "var(--color-accent)" }}
          >
            تسجيل الدخول
          </a>
        </div>
      )}

      {/* ─── Reviews List ─── */}
      <div>
        <h3 className="font-bold text-lg mb-4">
          آراء القراء{" "}
          {stats && stats.totalReviews > 0 && (
            <span
              className="text-sm font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              ({stats.totalReviews})
            </span>
          )}
        </h3>

        {reviews.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-color)] bg-[var(--card-bg)] p-10 text-center">
            <div className="text-5xl mb-3 opacity-40">💬</div>
            <p className="text-[var(--text-muted)]">
              لا توجد مراجعات لهذا الكتاب حتى الآن. كن أول من يقيّمه!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--card-bg)] p-5 transition-all hover:shadow-[var(--shadow-soft)]"
              >
                {/* Review header */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
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
                      getInitials(review.user.name)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">
                        {review.user.name}
                      </span>
                      {user?.id === review.user.id && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                            color: "var(--color-accent)",
                          }}
                        >
                          تقييمك
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill={s <= review.rating ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            style={{ color: "var(--color-accent)" }}
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {RATING_LABELS[review.rating]}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        · {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-[var(--foreground)] leading-relaxed mb-3 pr-13">
                    {review.comment}
                  </p>
                )}

                {/* Existing Replies */}
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-3 space-y-2 mr-4 border-r-2 border-[var(--color-accent)]/30 pr-4">
                    {review.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-[var(--radius-md)] p-3"
                        style={{
                          background: "color-mix(in srgb, var(--color-accent) 5%, var(--card-bg))",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden border border-[var(--border-color)]"
                            style={{
                              background: "color-mix(in srgb, var(--color-accent) 20%, var(--card-bg))",
                              color: "var(--color-accent)",
                            }}
                          >
                            {reply.author.avatar ? (
                              <img
                                src={
                                  reply.author.avatar.startsWith("http")
                                    ? reply.author.avatar
                                    : `${API.replace("/api", "")}${reply.author.avatar}`
                                }
                                alt={reply.author.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(reply.author.name)
                            )}
                          </div>
                          <span className="text-xs font-bold">{reply.author.name}</span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                              color: "var(--color-accent)",
                            }}
                          >
                            {reply.author.role === "admin" ? "المشرف" : "المؤلف"}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] mr-auto">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--foreground)] leading-relaxed pr-9">
                          {reply.replyText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply button & form */}
                {canReply && (
                  <div className="mt-3">
                    {replyingTo === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          placeholder="اكتب ردك على هذه المراجعة..."
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
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingTo(review.id);
                          setReplyText("");
                        }}
                        className="text-xs font-medium transition-colors hover:underline"
                        style={{ color: "var(--color-accent)" }}
                      >
                        ↩ رد على هذه المراجعة
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
