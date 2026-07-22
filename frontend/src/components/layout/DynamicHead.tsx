"use client";

import { useSettings } from "@/lib/settings/settings-context";
import { useEffect } from "react";

/**
 * DynamicHead — injects dynamic favicon, OG meta, and logo preload into <head>
 * using settings from the SettingsContext (real-time from DB).
 * Runs client-side, so it updates immediately when admin saves settings.
 */
export default function DynamicHead() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    // ── Logo Preload ────────────────────────────────────────────────────────
    // Preload the logo so it renders instantly in the Navbar (LCP optimization)
    if (settings.site_logo_url) {
      const existingPreload = document.querySelector(`link[rel="preload"][as="image"][href="${settings.site_logo_url}"]`);
      if (!existingPreload) {
        // Remove any old logo preloads
        document.querySelectorAll('link[rel="preload"][as="image"][data-logo]').forEach(el => el.remove());
        const preload = document.createElement("link");
        preload.rel = "preload";
        preload.as = "image";
        preload.href = settings.site_logo_url;
        preload.setAttribute("fetchpriority", "high");
        preload.setAttribute("data-logo", "true");
        document.head.prepend(preload); // prepend so it loads first
      }
    }

    // ── Favicon ────────────────────────────────────────────────────────────
    if (settings.favicon_url) {
      // Update existing favicons instead of removing them (prevents React removeChild errors)
      const existingIcons = document.querySelectorAll("link[rel~='icon']");
      if (existingIcons.length > 0) {
        existingIcons.forEach(el => {
          (el as HTMLLinkElement).href = settings.favicon_url;
        });
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = settings.favicon_url;
        // Detect type from URL
        link.type = settings.favicon_url.endsWith(".png") ? "image/png"
          : settings.favicon_url.endsWith(".webp") ? "image/webp"
          : settings.favicon_url.endsWith(".ico") ? "image/x-icon"
          : "image/webp";
        document.head.appendChild(link);
      }

      // Also set apple-touch-icon
      const existing = document.querySelector("link[rel='apple-touch-icon']");
      if (existing) {
        existing.setAttribute("href", settings.favicon_url);
      } else {
        const apple = document.createElement("link");
        apple.rel = "apple-touch-icon";
        apple.href = settings.favicon_url;
        document.head.appendChild(apple);
      }
    }

    // ── Open Graph image meta ─────────────────────────────────────────────
    if (settings.og_image_url) {
      const ogUrl = settings.og_image_url;

      // og:image
      const ogMeta = document.querySelector(`meta[property="og:image"]`);
      if (ogMeta) {
        ogMeta.setAttribute("content", ogUrl);
      } else {
        const meta = document.createElement("meta");
        meta.setAttribute("property", "og:image");
        meta.setAttribute("content", ogUrl);
        document.head.appendChild(meta);
      }

      // og:image:width / og:image:height
      ["og:image:width", "og:image:height"].forEach((prop, i) => {
        const val = i === 0 ? "1200" : "630";
        const el = document.querySelector(`meta[property="${prop}"]`);
        if (el) { el.setAttribute("content", val); }
        else {
          const m = document.createElement("meta");
          m.setAttribute("property", prop);
          m.setAttribute("content", val);
          document.head.appendChild(m);
        }
      });

      // og:image:alt
      const ogAlt = document.querySelector(`meta[property="og:image:alt"]`);
      if (ogAlt) {
        ogAlt.setAttribute("content", settings.site_name ?? "شعار الموقع");
      } else {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:image:alt");
        m.setAttribute("content", settings.site_name ?? "شعار الموقع");
        document.head.appendChild(m);
      }

      // twitter:image
      const twMeta = document.querySelector(`meta[name="twitter:image"]`);
      if (twMeta) {
        twMeta.setAttribute("content", ogUrl);
      } else {
        const meta = document.createElement("meta");
        meta.setAttribute("name", "twitter:image");
        meta.setAttribute("content", ogUrl);
        document.head.appendChild(meta);
      }

      // twitter:image:alt
      const twAlt = document.querySelector(`meta[name="twitter:image:alt"]`);
      if (twAlt) {
        twAlt.setAttribute("content", settings.site_name ?? "شعار الموقع");
      } else {
        const m = document.createElement("meta");
        m.setAttribute("name", "twitter:image:alt");
        m.setAttribute("content", settings.site_name ?? "شعار الموقع");
        document.head.appendChild(m);
      }
    }

    // ── Google Site Verification ──────────────────────────────────────────
    if (settings.google_site_verification) {
      const existing = document.querySelector(`meta[name="google-site-verification"]`);
      if (existing) {
        existing.setAttribute("content", settings.google_site_verification);
      } else {
        const m = document.createElement("meta");
        m.setAttribute("name", "google-site-verification");
        m.setAttribute("content", settings.google_site_verification);
        document.head.appendChild(m);
      }
    }

    // ── Dynamic <title> site name ─────────────────────────────────────────
    if (settings.site_name && !document.title.includes(settings.site_name)) {
      // Only update if not already set by Next.js metadata
      // (keep Next.js title format: "Page | SiteName")
    }

  }, [settings]);

  return null; // renders nothing — side effects only
}
