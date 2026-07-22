import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "خدماتنا",
  description: "خدمات مؤسسة أمانات ومكتبة أسامة في اليمن — قرطاسية، مستلزمات تعليمية، وهدايا.",
};

const servicesList = [
  {
    icon: "🎒",
    title: "المستلزمات التعليمية",
    description: "توفير كافة الأدوات المدرسية والجامعية، من الحقائب والقرطاسية إلى أدوات الهندسة والفنون بأفضل جودة.",
  },
  {
    icon: "🖨️",
    title: "خدمات الطباعة والتصوير",
    description: "طباعة المذكرات والبحوث والملخصات الجامعية بجودة عالية وأسعار منافسة للطلاب.",
  },
  {
    icon: "🎁",
    title: "الهدايا والإكسسوارات",
    description: "تشكيلة واسعة من الهدايا المميزة، التغليف الاحترافي، وإكسسوارات المكاتب الراقية.",
  },
  {
    icon: "📦",
    title: "خدمة الأمانات",
    description: "خدمة مبتكرة وموثوقة لحفظ الأمانات وتسليمها، لتسهيل تواصل الطلاب والباحثين في مدينة ذمار.",
  },
  {
    icon: "🚚",
    title: "التوصيل والتوزيع",
    description: "توصيل الكتب والمستلزمات إلى مختلف المناطق لتسهيل وصول المعرفة إلى كل طالب وقارئ.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-[var(--radius-xl)] bg-[var(--color-accent)] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-4xl">🌟</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
            أكثر من مجرد مكتبة
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            نسعى في أمانات ومكتبة أسامة لتقديم باقة متكاملة من الخدمات التي تلبي احتياجات القارئ والطالب والباحث.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {servicesList.map((service, index) => (
            <div key={index} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-8 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-accent)] transition-all group">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-right">
                {service.icon}
              </div>
              <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-3">
                {service.title}
              </h2>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-accent)]/10 border border-[var(--border-color)] rounded-[var(--radius-xl)] p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] mb-4">
            هل تبحث عن خدمة مخصصة؟
          </h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
            فريقنا مستعد دائماً لتلبية طلباتك الخاصة من الكتب، المستلزمات، أو خدمات النشر والتوزيع.
          </p>
          <Link href="/contact">
            <Button variant="accent" size="lg" className="min-h-[48px] font-bold">
              تواصل معنا الآن
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
