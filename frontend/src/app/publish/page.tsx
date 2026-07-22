"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button, Input } from "@/components/ui";
import { useNotifications } from "@/lib/notifications/notifications-context";

export default function PublishPage() {
  const { notify } = useNotifications();
  const [form, setForm] = useState({
    authorName: "",
    phone: "",
    email: "",
    manuscriptTitle: "",
    genre: "",
    pageCount: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission (will connect to API later)
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    notify({
      type: "success",
      title: "تم إرسال طلبك بنجاح!",
      message: "سنتواصل معك قريباً عبر واتساب أو البريد الإلكتروني.",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-4xl block mb-4">✍️</span>
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-3">
            انشر كتابك مع دار أسامة
          </h1>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            نحن هنا لمساعدتك في تحويل مخطوطتك إلى كتاب مطبوع أو رقمي احترافي.
            من التحرير حتى التوزيع — خطوة واحدة تكفيك.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { step: "١", label: "أرسل مخطوطتك", icon: "📤" },
            { step: "٢", label: "مراجعة وتحرير", icon: "🔍" },
            { step: "٣", label: "تصميم وطباعة", icon: "🖨️" },
            { step: "٤", label: "توزيع ونشر", icon: "📦" },
          ].map((s) => (
            <div key={s.step} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-[var(--color-accent)] font-bold text-sm mb-1">خطوة {s.step}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-bold mb-2">تم استلام طلبك!</h2>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  سيتواصل معك فريقنا خلال 24-48 ساعة للمتابعة.
                </p>
                <a href={`https://wa.me/967779121514?text=${encodeURIComponent("مرحباً، أرسلت طلب نشر كتاب وأريد المتابعة")}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="accent" size="md">تابع عبر واتساب</Button>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="font-bold text-lg mb-2">طلب نشر مخطوطة</h2>

                <Input
                  label="اسم المؤلف *"
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  placeholder="الاسم الكامل"
                  required
                />
                <Input
                  label="رقم الهاتف / واتساب *"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+967 7XX XXX XXX"
                  required
                />
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                />
                <Input
                  label="عنوان المخطوطة *"
                  value={form.manuscriptTitle}
                  onChange={(e) => setForm({ ...form, manuscriptTitle: e.target.value })}
                  placeholder="عنوان الكتاب"
                  required
                />
                <div>
                  <label className="block text-sm font-medium mb-1.5">النوع / التصنيف</label>
                  <select
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value="">اختر النوع</option>
                    <option>الأدب اليمني</option>
                    <option>الدراسات الإسلامية</option>
                    <option>التاريخ والتراث</option>
                    <option>تطوير الذات</option>
                    <option>الروايات والقصص</option>
                    <option>الشعر والأدب</option>
                    <option>العلوم والتكنولوجيا</option>
                    <option>الأطفال والناشئة</option>
                    <option>أخرى</option>
                  </select>
                </div>
                <Input
                  label="عدد الصفحات (تقريبي)"
                  type="number"
                  value={form.pageCount}
                  onChange={(e) => setForm({ ...form, pageCount: e.target.value })}
                  placeholder="مثال: 200"
                />
                <div>
                  <label className="block text-sm font-medium mb-1.5">نبذة عن الكتاب</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="اكتب نبذة مختصرة عن محتوى الكتاب..."
                    className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] resize-none"
                  />
                </div>

                <Button variant="accent" size="lg" type="submit">
                  {submitting ? "جارٍ الإرسال..." : "إرسال طلب النشر"}
                </Button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-5">
              <h3 className="font-bold mb-4">تواصل مباشرة</h3>
              <div className="flex flex-col gap-3">
                <a href="https://wa.me/967779121514" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-[var(--radius-md)] hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-semibold text-sm text-green-700 dark:text-green-400">واتساب</p>
                    <p className="text-xs text-[var(--text-muted)]">+967 779 121 514</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-3 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)]">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-sm">موقعنا</p>
                    <p className="text-xs text-[var(--text-muted)]">ذمار — شارع صنعاء تعز، بجانب محلات البحري</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-[var(--radius-lg)] p-5">
              <h3 className="font-bold mb-3 text-[var(--color-accent)]">لماذا دار أسامة؟</h3>
              <ul className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                {[
                  "✅ خبرة طويلة في نشر الكتب اليمنية",
                  "✅ أسعار مناسبة للمؤلفين",
                  "✅ توزيع داخل اليمن وخارجه",
                  "✅ نشر رقمي وورقي",
                  "✅ دعم كامل طوال رحلة النشر",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
