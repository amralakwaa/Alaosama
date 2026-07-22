import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأقسام",
  description: "تصفّح الكتب اليمنية والعربية حسب القسم — أدب يمني، تاريخ، فقه، تطوير ذات وأكثر.",
  openGraph: {
    title: "أقسام مكتبة أسامة — ذمار، اليمن",
    description: "اختر القسم الذي يناسب اهتمامك وابدأ رحلة القراءة مع مكتبة أسامة.",
    url: "https://amanat.ye/categories",
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
