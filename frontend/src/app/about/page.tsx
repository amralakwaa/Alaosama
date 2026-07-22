import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرّف على مؤسسة أمانات ومكتبة أسامة — رسالتنا، رؤيتنا، وقصتنا في خدمة الكتاب والمعرفة في اليمن.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-[var(--radius-xl)] bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-4xl">أ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
            من نحن
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            أمانات ومكتبة أسامة — وجهتك الرقمية للكتاب والمعرفة في اليمن
          </p>
        </div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-8">
            <div className="text-3xl mb-4">📖</div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-3">قصتنا</h2>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              بدأت مكتبة أسامة رحلتها في مدينة ذمار، حاملةً رسالة نشر الكتاب وتيسير الوصول إليه لكل يمني.
              اليوم، نطوّر هذه الرسالة رقمياً لتشمل الكتاب الإلكتروني، وخدمات النشر، ومجتمع القراء.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-8">
            <div className="text-3xl mb-4">🎯</div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-3">رسالتنا</h2>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              نؤمن بأن الكتاب حق للجميع. نسعى إلى توفير محتوى معرفي عربي عالي الجودة، ودعم المؤلفين اليمنيين في نشر أعمالهم وإيصالها للقارئ أينما كان.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-8">
            <div className="text-3xl mb-4">🌟</div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-3">رؤيتنا</h2>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              أن نكون المنصة الرقمية الأولى للكتاب في اليمن، ونقطة التقاء بين المؤلف والقارئ، وجسراً للمعرفة يتجاوز الحدود الجغرافية.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-8">
            <div className="text-3xl mb-4">🤝</div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-3">قيمنا</h2>
            <p className="text-[var(--text-muted)] leading-relaxed text-sm">
              الأمانة في التعامل، الجودة في المحتوى، الشفافية في العمل، والحرص على حقوق المؤلفين والقراء على حدٍّ سواء.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 border border-[var(--border-color)] rounded-[var(--radius-xl)] p-8 text-center mb-16">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-8">أمانات بالأرقام</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "٢٠+", label: "كتاب منشور" },
              { value: "١٠+", label: "مؤلف" },
              { value: "١٠٠٠+", label: "قارئ" },
              { value: "٥+", label: "تصنيف" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-[var(--color-accent)] mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">انضم إلى مجتمع القراء</h2>
          <p className="text-[var(--text-muted)] mb-6">سجّل حسابك مجاناً واستمتع بآلاف الكتب</p>
          <div className="flex gap-3 justify-center">
            <Link href="/register">
              <Button variant="accent" size="md" className="font-bold">
                أنشئ حسابك
              </Button>
            </Link>
            <Link href="/books">
              <Button variant="ghost" size="md" className="font-bold">
                تصفح المكتبة
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
