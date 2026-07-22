import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { NotificationsProvider } from "@/lib/notifications/notifications-context";
import { SettingsProvider } from "@/lib/settings/settings-context";
import FloatingContactButtons from "@/components/layout/FloatingContactButtons";
import AuthModal from "@/components/ui/AuthModal";
import Footer from "@/components/layout/Footer";
import DynamicHead from "@/components/layout/DynamicHead";
import AIAssistant from "@/components/ai/AIAssistant";

export const metadata: Metadata = {
  metadataBase: new URL("https://amanat.ye"),
  title: {
    default: "أمانات ومكتبة أسامة — الوجهة الرقمية للكتاب في اليمن",
    template: "%s | أمانات ومكتبة أسامة",
  },
  description:
    "مكتبة أسامة — وجهتك للكتب والمعرفة في اليمن. اقرأ، اكتشف، وانشر كتابك مع دار أسامة للنشر. مكتبة ذمار الرقمية.",
  keywords: [
    "مكتبة أسامة", "دار أسامة للنشر", "مكتبة ذمار",
    "كتب يمنية", "نشر كتاب في اليمن", "مؤلفين يمنيين",
    "مكتبة إلكترونية يمنية", "شراء كتب اليمن", "أمانات ذمار",
  ],
  authors: [{ name: "مؤسسة أمانات ومكتبة أسامة" }],
  creator: "مؤسسة أمانات ومكتبة أسامة",
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "ar_YE",
    url: "https://amanat.ye",
    siteName: "أمانات ومكتبة أسامة",
    title: "أمانات ومكتبة أسامة — الوجهة الرقمية للكتاب في اليمن",
    description: "اكتشف الكتب اليمنية، انشر مؤلَّفك، واستفد من خدماتنا المتكاملة.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "أمانات ومكتبة أسامة" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "أمانات ومكتبة أسامة",
    description: "الوجهة الرقمية للكتاب في اليمن.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* IBM Plex Sans Arabic */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Dark mode script - prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme');
                  if (mode === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {/* Skip to Content — Accessibility */}
        <a href="#main-content" className="skip-to-content">
          تخطي إلى المحتوى الرئيسي
        </a>
        {/* LocalBusiness JSON-LD Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "مؤسسة أمانات ومكتبة أسامة",
              "alternateName": "أمانات ومكتبة أسامة",
              "description": "مؤسسة يمنية تجمع بين المكتبة ودار النشر والخدمات المتنوعة، وتسعى لأن تكون الوجهة الرقمية الأولى للكتاب في اليمن.",
              "url": "https://amanat.ye",
              "telephone": "+967780475124",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "ذمار",
                "addressRegion": "ذمار",
                "addressCountry": "YE",
                "streetAddress": "اليمن - محافظة ذمار"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 14.564790973375231,
                "longitude": 44.38898091291654
              },
              "openingHours": ["Sa-Th 08:00-20:00"],
              "sameAs": [],
              "hasMap": "https://maps.app.goo.gl/4PK2W78ACY73pXkt8",
              "@id": "https://amanat.ye"
            })
          }}
        />
        <SettingsProvider>
          <DynamicHead />
          <NotificationsProvider>
            <AuthProvider>
              <div id="main-content">
                {children}
              </div>
              <Footer />
              <FloatingContactButtons />
              <AIAssistant />
              <AuthModal />
            </AuthProvider>
          </NotificationsProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
