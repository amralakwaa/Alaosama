import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المكتبة",
  description: "تصفّح الكتب اليمنية والعربية — مكتبة أسامة ذمار الرقمية.",
  openGraph: {
    title: "مكتبة أسامة — كتب يمنية وعربية",
    description: "اكتشف الكتب اليمنية والعربية، اقرأ مجاناً أو احصل على نسختك الرقمية.",
    url: "https://amanat.ye/books",
  },
};

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
