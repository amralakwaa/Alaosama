import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "دار النشر — انشر كتابك مع أسامة",
  description: "دار أسامة للنشر والتوزيع في اليمن — انشر كتابك ورقياً ورقمياً وأوصله للقرّاء في كل مكان.",
};

const steps = [
  { step: "١", title: "قدّم طلبك", desc: "أرسل مخطوطتك مع المعلومات الأساسية عبر لوحة المؤلف." },
  { step: "٢", title: "مراجعة التحرير", desc: "يقوم فريقنا بمراجعة المخطوطة وإبداء الملاحظات خلال أسبوع." },
  { step: "٣", title: "الإعداد والتصميم", desc: "نتولى تنسيق الكتاب، تصميم الغلاف، ومراجعة اللغة." },
  { step: "٤", title: "النشر والتوزيع", desc: "يُنشر كتابك رقمياً على المنصة، وورقياً عبر شبكة توزيعنا." },
];

const plans = [
  {
    name: "النشر الرقمي",
    price: "مجاني",
    features: ["نشر على المنصة الرقمية", "صفحة مؤلف مستقلة", "إحصائيات القراءة", "دعم فني"],
    accent: false,
  },
  {
    name: "النشر الكامل",
    price: "بالتفاوض",
    features: ["طباعة ورقية", "توزيع محلي", "تصميم غلاف احترافي", "تحرير لغوي", "نشر رقمي", "حقوق مؤلف موثّقة"],
    accent: true,
  },
  {
    name: "الخدمة الذاتية",
    price: "رسوم رمزية",
    features: ["رفع ملفك مباشرة", "غلاف من قوالب جاهزة", "نشر سريع", "تحرير ذاتي"],
    accent: false,
  },
];

export default function PublishingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 px-4 text-center overflow-hidden border-b border-[var(--border-color)]">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <span className="inline-block bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-bold px-4 py-1.5 rounded-full mb-6">
              دار أسامة للنشر والتوزيع
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-display)] mb-6 leading-tight">
              فكرتك تستحق <br/>
              <span className="text-[var(--color-accent)]">أن تُقرأ</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              نساعد المؤلفين اليمنيين في نشر كتبهم ورقمياً وورقياً بأعلى جودة وأقل تعقيد.
              كتابك يستحق أن يصل إلى كل يد.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register">
                <Button variant="accent" size="lg" className="font-bold">
                  ابدأ رحلتك الآن
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" size="lg" className="bg-[var(--card-bg)] font-bold">
                  تحدّث مع فريقنا
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-20">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-center mb-12">
            كيف تنشر كتابك؟
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -left-3 text-[var(--text-muted)] text-xl">←</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section className="bg-[var(--card-bg)] border-y border-[var(--border-color)]">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-20">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-center mb-12">
              خطط النشر
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.name} className={`rounded-[var(--radius-xl)] p-6 border ${
                  plan.accent
                    ? "border-[var(--color-accent)] bg-gradient-to-b from-[var(--color-accent)]/5 to-transparent relative"
                    : "border-[var(--border-color)] bg-[var(--background)]"
                }`}>
                  {plan.accent && (
                    <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 rounded-full">
                      الأكثر شمولاً
                    </span>
                  )}
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <p className={`font-black text-2xl mb-5 ${plan.accent ? "text-[var(--color-accent)]" : ""}`}>{plan.price}</p>
                  <ul className="flex flex-col gap-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span className="text-emerald-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="w-full">
                    <Button 
                      variant={plan.accent ? "accent" : "ghost"} 
                      size="sm" 
                      className="w-full font-bold"
                    >
                      ابدأ الآن
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-4">جاهز لنشر كتابك؟</h2>
          <p className="text-[var(--text-muted)] mb-8">انضم إلى مجتمع المؤلفين في أمانات ومكتبة أسامة</p>
          <Link href="/register">
            <Button variant="accent" size="lg" className="font-bold">
              أنشئ حسابك كمؤلف
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
