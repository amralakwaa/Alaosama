"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Input, Button } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Settings {
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  address?: string;
  working_hours?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  google_map_url?: string;
  map_latitude?: string;
  map_longitude?: string;
  google_business_url?: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch(`${API}/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setSettings(d || {}))
      .catch(() => {});
  }, []);

  const phone = settings.phone || "";
  const whatsapp = settings.whatsapp_number || "";
  const email = settings.email || "";
  const address = settings.address || "";
  const workingHours = settings.working_hours || "";
  const lat = settings.map_latitude || "";
  const lng = settings.map_longitude || "";
  const mapUrl = settings.google_map_url || (lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : "");

  const contactItems = [
    {
      icon: "📍", title: "الموقع",
      value: address, sub: "اضغط لفتح في خرائط Google",
      href: mapUrl, external: true,
      color: "#FF5252",
    },
    {
      icon: "📞", title: "الهاتف",
      value: `+${phone}`, sub: "متاح خلال ساعات العمل",
      href: `tel:+${phone}`, external: false,
      color: "var(--color-accent)",
    },
    {
      icon: "💬", title: "واتساب",
      value: "تواصل عبر واتساب", sub: "ردود سريعة",
      href: `https://wa.me/${whatsapp}`, external: true,
      color: "#25D366",
    },
    {
      icon: "✉️", title: "البريد الإلكتروني",
      value: email, sub: "نرد خلال 24 ساعة",
      href: `mailto:${email}`, external: false,
      color: "var(--color-primary)",
    },
    {
      icon: "🕐", title: "ساعات العمل",
      value: workingHours, sub: "الجمعة: إجازة رسمية",
      href: null, external: false,
      color: "#64B4FF",
    },
  ];

  const socialLinks = [
    settings.instagram_url ? { label: "Instagram", href: settings.instagram_url, icon: "◉", color: "#E1306C" } : null,
    settings.facebook_url ? { label: "Facebook", href: settings.facebook_url, icon: "f", color: "#1877F2" } : null,
    settings.tiktok_url ? { label: "TikTok", href: settings.tiktok_url, icon: "♪", color: "#000" } : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      {/* Page title schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "اتصل بنا - أمانات ومكتبة أسامة",
          "url": "https://amanat.ye/contact",
          "mainEntity": {
            "@type": "LocalBusiness",
            "telephone": `+${phone}`,
            "email": email,
            "address": { "@type": "PostalAddress", "addressLocality": "ذمار", "addressCountry": "YE" }
          }
        })}}
      />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: "var(--color-accent)15", color: "var(--color-accent)" }}>
            <span>📍</span> نحن في ذمار، اليمن
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] mb-4">
            اتصل بنا
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
            نحن هنا لمساعدتك — تواصل معنا بأي طريقة تناسبك
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 mb-10">
          {/* Contact Cards */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {contactItems.map(item => (
              <div
                key={item.title}
                className="rounded-[var(--radius-lg)] border p-4 flex gap-4 items-start transition-all hover:shadow-md"
                style={{ background: "var(--card-bg)", borderColor: "var(--border-color)" }}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${item.color}18` }}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm mb-0.5">{item.title}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="text-sm hover:underline transition-colors"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.value}</p>
                  )}
                  {item.sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)", opacity: 0.7 }}>{item.sub}</p>}
                </div>
              </div>
            ))}

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="rounded-[var(--radius-lg)] border p-4" style={{ background: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <p className="font-bold text-sm mb-3">تابعنا على</p>
                <div className="flex gap-3">
                  {socialLinks.map((s: any) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
                      style={{ background: `${s.color}18`, color: s.color }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Open in Google Maps button */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-[var(--radius-lg)] text-sm font-bold text-center flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "var(--color-accent)", color: "white" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              فتح الموقع في خرائط Google
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 rounded-[var(--radius-xl)] border p-6" style={{ background: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-5">أرسل رسالة</h2>
            <form className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    id="contact-name"
                    type="text"
                    required
                    label="الاسم الكامل"
                    placeholder="اسمك الكامل"
                  />
                </div>
                <div>
                  <Input
                    id="contact-phone"
                    type="tel"
                    label="رقم الهاتف"
                    placeholder="+967 xxx xxx xxx"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  label="البريد الإلكتروني"
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">الموضوع</label>
                <select
                  id="contact-subject"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)]"
                >
                  <option>استفسار عام</option>
                  <option>طلب نشر كتاب</option>
                  <option>شراء خدمة</option>
                  <option>خدمة الأمانات والطرود</option>
                  <option>تقرير مشكلة</option>
                  <option>شراكة أو تعاون</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">الرسالة</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all resize-none bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] placeholder:text-[var(--text-muted)]"
                />
              </div>
              <Button
                type="submit"
                variant="accent"
                size="md"
                className="w-full mt-2 font-bold"
              >
                إرسال الرسالة
              </Button>
            </form>
          </div>
        </div>

        {/* Interactive Google Map */}
        <div className="rounded-[var(--radius-xl)] overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--border-color)" }}>
            <div>
              <h2 className="font-bold text-sm">موقعنا على الخريطة</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{address}</p>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
              style={{ background: "var(--color-accent)", color: "white" }}
            >
              فتح في Google Maps
            </a>
          </div>
          <iframe
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=ar`}
            width="100%"
            height="400"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع مؤسسة أمانات ومكتبة أسامة"
          />
        </div>
      </main>
    </div>
  );
}
