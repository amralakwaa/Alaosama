"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useSettings } from "@/lib/settings/settings-context";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

type SettingsMap = Record<string, string>;

interface Field {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
}

interface Section {
  title: string;
  icon: string;
  fields: Field[];
}

const SECTIONS: Section[] = [
  {
    title: "معلومات المؤسسة",
    icon: "🏢",
    fields: [
      { key: "site_name", label: "اسم المنصة", placeholder: "أمانات ومكتبة أسامة" },
      { key: "site_description", label: "وصف المؤسسة", type: "textarea", placeholder: "نص تعريفي يظهر في الفوتر" },
      { key: "site_logo_url", label: "شعار الموقع", type: "image", hint: "يُفضل استخدام صورة شفافة (PNG) بأبعاد مربعة — سيتم تحويلها إلى WebP تلقائياً" },
      { key: "favicon_url", label: "الفافيكون (Favicon)", type: "image", hint: "أيقونة تظهر في تبويب المتصفح، يُفضل 32×32 أو 64×64 بكسل" },
      { key: "og_image_url", label: "صورة المشاركة (Open Graph)", type: "image", hint: "تظهر عند مشاركة الموقع على وسائل التواصل، يُفضل 1200×630 بكسل" },
    ],
  },
  {
    title: "بيانات التواصل",
    icon: "📞",
    fields: [
      { key: "phone", label: "رقم الهاتف", placeholder: "967780475124", hint: "بدون + أو أصفار" },
      { key: "whatsapp_number", label: "رقم الواتساب", placeholder: "967780475124", hint: "بدون + أو أصفار" },
      { key: "email", label: "البريد الإلكتروني", type: "email", placeholder: "info@amanat.ye" },
      { key: "address", label: "العنوان", placeholder: "اليمن - محافظة ذمار" },
      { key: "working_hours", label: "ساعات العمل", placeholder: "السبت - الخميس: 8ص - 8م" },
    ],
  },
  {
    title: "روابط التواصل الاجتماعي",
    icon: "📱",
    fields: [
      { key: "instagram_url", label: "رابط Instagram", type: "url", placeholder: "https://instagram.com/..." },
      { key: "facebook_url", label: "رابط Facebook", type: "url", placeholder: "https://facebook.com/..." },
      { key: "tiktok_url", label: "رابط TikTok", type: "url", placeholder: "https://tiktok.com/@..." },
    ],
  },
  {
    title: "إعدادات خريطة Google Maps",
    icon: "🗺️",
    fields: [
      { key: "map_latitude", label: "خط العرض (Latitude)", placeholder: "14.5529", hint: "إحداثية الموقع الشمالية" },
      { key: "map_longitude", label: "خط الطول (Longitude)", placeholder: "44.3776", hint: "إحداثية الموقع الشرقية" },
      { key: "google_map_url", label: "رابط Google Maps", type: "url", placeholder: "https://maps.google.com/..." },
      { key: "map_enabled", label: "تفعيل الخريطة (true / false)", placeholder: "true", hint: "اكتب true لتفعيل أو false لإخفاء الخريطة" },
    ],
  },
  {
    title: "Google Business Profile",
    icon: "🔍",
    fields: [
      { key: "google_business_url", label: "رابط Google Business Profile", type: "url", placeholder: "https://business.google.com/..." },
      { key: "google_site_verification", label: "كود Google Site Verification", placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", hint: "يُضاف في meta tag للتحقق من الملكية" },
    ],
  },
  {
    title: "مفاتيح الـ API (المساعد الذكي)",
    icon: "🤖",
    fields: [
      { key: "groq_api_key", label: "مفتاح API", type: "password", placeholder: "sk-...", hint: "مفتاح الاتصال بخدمات الذكاء الاصطناعي (يتم حفظه بأمان)" },
      { key: "groq_model", label: "الموديل (AI Model)", placeholder: "llama-3.3-70b-versatile", hint: "الموديل الافتراضي المستخدم للمساعد الذكي وتوليد النصوص" },
      { key: "ai_base_url", label: "الرابط الأساسي (Base URL)", type: "url", placeholder: "https://api.groq.com/openai/v1/chat/completions", hint: "رابط خدمة الـ API (مثل Groq أو OpenAI أو DeepSeek)" },
    ],
  },
];

export default function AdminSettingsPage() {
  const { accessToken } = useAuth();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/settings?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setSettings(data || {});
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, [accessToken]);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const batch = Object.keys(settings).map(key => ({ 
      key, 
      value: settings[key] !== null && settings[key] !== undefined ? String(settings[key]) : "" 
    }));
    try {
      const res = await fetch(`${API}/settings/admin/batch`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ settings: batch }),
      });
      if (res.ok) {
        setFeedback({ type: "success", msg: "✅ تم حفظ الإعدادات بنجاح!" });
        await refreshSettings();
      } else {
        throw new Error();
      }
    } catch {
      setFeedback({ type: "error", msg: "❌ فشل حفظ الإعدادات" });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-[var(--radius-lg)] animate-pulse" style={{ background: "var(--border-color)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">إعدادات المنصة</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          التحكم الكامل بمعلومات المؤسسة، الفوتر، الخريطة، وروابط التواصل
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="mb-6 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium"
          style={{
            background: feedback.type === "success" ? "color-mix(in srgb, #22c55e 12%, transparent)" : "color-mix(in srgb, #ef4444 12%, transparent)",
            color: feedback.type === "success" ? "#22c55e" : "#ef4444",
            border: `1px solid ${feedback.type === "success" ? "#22c55e" : "#ef4444"}40`,
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {SECTIONS.map(section => (
          <div
            key={section.title}
            className="rounded-[var(--radius-lg)] border p-6"
            style={{ background: "var(--background)", borderColor: "var(--border-color)" }}
          >
            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
              <span className="text-xl">{section.icon}</span>
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold mb-1.5">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={settings[field.key] || ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      rows={3}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm resize-none focus:outline-none transition-colors"
                      style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                    />
                  ) : field.type === "image" ? (
                    <div className="flex items-center gap-4">
                      {settings[field.key] ? (
                        <div className="relative w-16 h-16 rounded-[var(--radius-md)] border border-[var(--border-color)] overflow-hidden bg-[var(--card-bg)] flex items-center justify-center shrink-0">
                          <img
                            src={settings[field.key]}
                            alt={`معاينة ${field.label}`}
                            title={field.label}
                            className="max-w-full max-h-full object-contain"
                          />
                          <button
                            onClick={() => handleChange(field.key, "")}
                            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity"
                            title="إزالة الصورة"
                            aria-label={`إزالة ${field.label}`}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-[var(--radius-md)] border border-[var(--border-color)] border-dashed flex items-center justify-center bg-[var(--card-bg)] text-[var(--text-muted)] shrink-0" aria-hidden>
                          📷
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          id={`upload-${field.key}`}
                          aria-label={`رفع ${field.label}`}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSaving(true);
                            const formData = new FormData();
                            formData.append("file", file);
                            // Use /upload/logo for branding images (max 1MB, WebP)
                            const uploadEndpoint = (field.key === "site_logo_url" || field.key === "favicon_url" || field.key === "og_image_url")
                              ? `${API}/upload/logo`
                              : `${API}/upload/image`;
                            try {
                              const res = await fetch(uploadEndpoint, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${accessToken}` },
                                body: formData,
                              });
                              if (res.ok) {
                                const data = await res.json();
                                handleChange(field.key, data.url);
                                setFeedback({ type: "success", msg: `✅ تم رفع ${field.label} — WebP، ضغط ${data.compressionRatio}%` });
                                setTimeout(() => setFeedback(null), 5000);
                              } else {
                                const err = await res.json().catch(() => ({}));
                                setFeedback({ type: "error", msg: `❌ فشل رفع الصورة: ${err.message ?? "حدث خطأ"}` });
                              }
                            } catch {
                              setFeedback({ type: "error", msg: "❌ حدث خطأ أثناء رفع الصورة" });
                            } finally {
                              setSaving(false);
                              e.target.value = "";
                            }
                          }}
                          className="block w-full text-sm text-[var(--text-muted)] file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-[var(--radius-md)] file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-accent)] file:text-white hover:file:opacity-90 transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={settings[field.key] || ""}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm focus:outline-none transition-colors"
                      style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
                      dir={field.type === "url" || field.type === "email" || field.type === "password" || field.key.includes("api_key") ? "ltr" : undefined}
                    />
                  )}
                  {field.hint && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{field.hint}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Map Preview */}
      {settings.map_latitude && settings.map_longitude && (
        <div className="mt-6 rounded-[var(--radius-lg)] overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
          <div className="px-4 py-3 text-sm font-semibold" style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border-color)" }}>
            🗺️ معاينة الخريطة
          </div>
          <iframe
            src={`https://maps.google.com/maps?q=${settings.map_latitude},${settings.map_longitude}&z=14&output=embed&hl=ar`}
            width="100%"
            height="250"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            title="معاينة الخريطة"
          />
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-4 items-center">
        <button
          onClick={loadSettings}
          className="px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium border transition-colors hover:bg-[var(--card-bg-hover)]"
          style={{ borderColor: "var(--border-color)" }}
        >
          إعادة التحميل
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-2.5 rounded-[var(--radius-md)] text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--color-accent)" }}
        >
          {saving ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
        </button>
      </div>
    </div>
  );
}
