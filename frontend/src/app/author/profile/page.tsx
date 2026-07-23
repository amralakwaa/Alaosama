"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AuthorProfilePage() {
  const { accessToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: (user as any).bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  /** Upload avatar via /upload/avatar → WebP 300×300 */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setFeedback(null);

    const formPayload = new FormData();
    formPayload.append("file", file);

    try {
      const res = await fetch(`${API}/upload/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formPayload,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatar: data.url }));
        setFeedback({ type: "success", msg: `✅ تم رفع الصورة وضغطها بنسبة ${data.compressionRatio}%` });
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedback({ type: "error", msg: `❌ ${err.message ?? "فشل رفع الصورة"}` });
      }
    } catch {
      setFeedback({ type: "error", msg: "❌ حدث خطأ أثناء رفع الصورة" });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API}/users/me/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFeedback({ type: "success", msg: "✅ تم تحديث الملف الشخصي بنجاح" });
        // Soft refresh — let context re-fetch user
        setTimeout(() => window.location.reload(), 1200);
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedback({ type: "error", msg: `❌ ${err.message ?? "حدث خطأ أثناء التحديث"}` });
      }
    } catch {
      setFeedback({ type: "error", msg: "❌ حدث خطأ أثناء الاتصال بالخادم" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">الملف الشخصي</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">تحديث بياناتك وسيرتك الذاتية التي تظهر للقراء</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="mb-5 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium"
          style={{
            background: feedback.type === "success"
              ? "color-mix(in srgb, #22c55e 12%, transparent)"
              : "color-mix(in srgb, #ef4444 12%, transparent)",
            color: feedback.type === "success" ? "#22c55e" : "#ef4444",
            border: `1px solid ${feedback.type === "success" ? "#22c55e" : "#ef4444"}40`,
          }}
        >
          {feedback.msg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--background)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-color)] flex flex-col gap-6"
      >
        {/* ── Avatar Section ── */}
        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative w-24 h-24 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full flex items-center justify-center text-4xl shrink-0 border-2 border-[var(--color-accent)]/20 overflow-hidden">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={`صورة ${formData.name || "المؤلف"}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span aria-hidden>✍️</span>
            )}
            {/* Upload overlay */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-bold"
              aria-label="تغيير صورة الملف الشخصي"
            >
              {uploadingAvatar ? "⏳" : "📷 تغيير"}
            </button>
          </div>

          {/* Upload Button & Info */}
          <div className="flex-1">
            <label className="block text-sm font-bold mb-2">الصورة الشخصية</label>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
              aria-label="رفع صورة شخصية"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="mb-2"
            >
              {uploadingAvatar ? "⏳ جاري رفع الصورة..." : "📤 رفع صورة جديدة"}
            </Button>
            <p className="text-xs text-[var(--text-muted)]">
              يُقبل: JPG, PNG, WebP — حجم أقصى 2MB<br />
              سيتم تحويلها تلقائياً إلى WebP بأبعاد 300×300
            </p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="author-name">
            الاسم الكامل (كما سيظهر على كتبك)
          </label>
          <Input
            id="author-name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="أدخل اسمك الكامل"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="author-bio">
            نبذة عنك (السيرة الذاتية)
          </label>
          <textarea
            id="author-bio"
            className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-3 h-32 focus:outline-none focus:border-[var(--color-accent)] resize-none text-sm"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            placeholder="اكتب نبذة مختصرة عن مسيرتك الأدبية أو الأكاديمية..."
          />
        </div>

        <Button type="submit" variant="accent" disabled={loading || uploadingAvatar} className="w-fit">
          {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>
      </form>
    </div>
  );
}
