"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/lib/settings/settings-context";
import InstallAppButton from "./InstallAppButton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Settings {
  site_name?: string;
  site_description?: string;
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
  map_enabled?: string;
  designer_name?: string;
  designer_phone?: string;
}

// ─── SVG Social Icons ────────────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.13-1.34a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

export default function Footer() {
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const siteName = settings.site_name || "";
  const description = settings.site_description || "";
  const phone = settings.phone || "";
  const whatsapp = settings.whatsapp_number || "";
  const email = settings.email || "";
  const address = settings.address || "";
  const workingHours = settings.working_hours || "";
  const lat = settings.map_latitude || "";
  const lng = settings.map_longitude || "";
  const mapUrl = settings.google_map_url || "";
  const mapEnabled = settings.map_enabled === "true";
  
  const designerName = "م عمر بلال الاكوع + م اسامة المحياء";
  const designerPhone = "967780475125";

  const quickLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "المكتبة", href: "/books" },
    { label: "الكتب", href: "/books" },
    { label: "المؤلفون", href: "/authors" },
    { label: "الخدمات", href: "/services" },
    { label: "دار النشر", href: "/publishing" },
    { label: "اتصل بنا", href: "/contact" },
  ];

  const serviceLinks = [
    { label: "خدمة الأمانات والطرود", href: "/services" },
    { label: "المستلزمات التعليمية والمكتبية", href: "/services" },
    { label: "الهدايا والإكسسوارات", href: "/services" },
    { label: "طلب نشر كتاب", href: "/publishing" },
  ];

  const socialLinks = [
    settings.instagram_url ? { label: "Instagram", href: settings.instagram_url, icon: <InstagramIcon />, color: "#E1306C" } : null,
    settings.facebook_url ? { label: "Facebook", href: settings.facebook_url, icon: <FacebookIcon />, color: "#1877F2" } : null,
    settings.tiktok_url ? { label: "TikTok", href: settings.tiktok_url, icon: <TikTokIcon />, color: "#000" } : null,
  ].filter(Boolean);

  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer dir="rtl" className="relative overflow-hidden" style={{ background: "var(--footer-bg, color-mix(in srgb, var(--background) 95%, var(--color-primary)))", borderTop: "1px solid var(--border-color)" }}>
      {/* Decorative top gradient bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-primary))" }} />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* ─── Column 1: About ─── */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {settings?.site_logo_url ? (
                <img src={settings.site_logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}>
                  أ
                </div>
              )}
              <h2 className="text-base font-black leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {siteName}
              </h2>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
              {description}
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-2 flex-wrap">
              {/* WhatsApp always shown */}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                title="واتساب"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-0.5"
                style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}
              >
                <WhatsAppIcon />
              </a>
              {socialLinks.map((s: any) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-0.5"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="mt-6">
              <InstallAppButton variant="outline" className="w-full" />
            </div>
          </div>

          {/* ─── Column 2: Quick Links ─── */}
          <div>
            <h3 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <span className="w-1 h-4 rounded-full inline-block" style={{ background: "var(--color-accent)" }} />
              روابط سريعة
            </h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm flex items-center gap-2 group transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--color-accent)" }}>
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    <span className="group-hover:text-[var(--color-accent)] transition-colors">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Column 3: Services ─── */}
          <div>
            <h3 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <span className="w-1 h-4 rounded-full inline-block" style={{ background: "var(--color-accent)" }} />
              خدمات المؤسسة
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm flex items-center gap-2 group transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--color-accent)" }}>
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    <span className="group-hover:text-[var(--color-accent)] transition-colors">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Column 4: Contact ─── */}
          <div>
            <h3 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <span className="w-1 h-4 rounded-full inline-block" style={{ background: "var(--color-accent)" }} />
              بيانات التواصل
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:+${phone}`}
                  className="flex items-center gap-2.5 text-sm group transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "var(--color-accent)", color: "white", opacity: 0.85 }}>
                    <PhoneIcon />
                  </span>
                  <span className="group-hover:text-[var(--color-accent)] transition-colors" dir="ltr">+{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm group transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#25D366", color: "white", opacity: 0.85 }}>
                    <WhatsAppIcon />
                  </span>
                  <span className="group-hover:text-[var(--color-accent)] transition-colors">تواصل عبر واتساب</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2.5 text-sm group transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-primary)", color: "white", opacity: 0.85 }}>
                    <EmailIcon />
                  </span>
                  <span className="group-hover:text-[var(--color-accent)] transition-colors" dir="ltr">{email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,80,80,0.15)", color: "#FF5252" }}>
                  <MapPinIcon />
                </span>
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(100,180,255,0.12)", color: "#64B4FF" }}>
                  <ClockIcon />
                </span>
                <span>{workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Interactive Google Map ─── */}
        {mapEnabled && mounted && (
          <div className="mb-10 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--card-bg)" }}>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-accent)" }}>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="text-sm font-semibold">{address}</span>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                style={{ background: "var(--color-accent)", color: "white" }}
              >
                فتح في خرائط Google
              </a>
            </div>
            <div className="relative" style={{ height: "280px" }}>
              <iframe
                src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=ar`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع مؤسسة أمانات ومكتبة أسامة"
              />
            </div>
          </div>
        )}

        {/* ─── Divider ─── */}
        <div className="border-t mb-6" style={{ borderColor: "var(--border-color)" }} />

        {/* ─── Bottom Bar ─── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <p>
            © {currentYear} <span className="font-semibold" style={{ color: "var(--foreground)" }}>{siteName}</span> — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-1.5">
            <span>بُني وصُمم بواسطة</span>
            <a
              href={`tel:+${designerPhone}`}
              className="font-bold transition-colors hover:underline"
              style={{ color: "var(--color-accent)" }}
            >
              {designerName}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
