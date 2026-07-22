"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useSettings } from "@/lib/settings/settings-context";
import InstallAppButton from "./InstallAppButton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const PUBLIC_LINKS = [
  { label: "المكتبة",   href: "/books" },
  { label: "المؤلفون",  href: "/authors" },
  { label: "دار النشر", href: "/publishing" },
  { label: "الخدمات",  href: "/services" },
  { label: "من نحن",   href: "/about" },
];

/* ── Search Icon ── */
function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

/* ── Bell Icon ── */
function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  );
}

/* ── Moon / Sun ── */
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      className="touch-target flex items-center justify-center rounded-full transition-all duration-200"
      style={{
        width: 36, height: 36, background: 'var(--accent-muted)',
        color: 'var(--gold-500)', border: '1px solid rgba(184,128,10,0.20)',
      }}
      aria-label={dark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      data-tooltip={dark ? "الوضع النهاري" : "الوضع الليلي"}
    >
      {dark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { user, logout, isLoading, accessToken } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Notifications */
  useEffect(() => {
    if (user && accessToken) {
      fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((r) => r.json())
        .then((d) => setNotifications(Array.isArray(d) ? d : []))
        .catch(console.error);
    }
  }, [user, accessToken]);

  /* Outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node))
        setShowNotifs(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Focus search when opens */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  /* Close mobile on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: number, link: string) => {
    await fetch(`${API}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setShowNotifs(false);
    if (link) router.push(link);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const dashboardLink =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "author"
      ? "/author"
      : "/dashboard";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header
        className={`navbar-glass sticky top-0 z-[var(--z-nav)] transition-all duration-300 ${
          scrolled ? "shadow-[var(--shadow-md)]" : ""
        }`}
        style={{ height: "var(--nav-height)" }}
      >
        <div
          className="flex items-center justify-between gap-4 h-full"
          style={{ maxWidth: "var(--container)", margin: "0 auto", paddingInline: "clamp(1rem, 4vw, 2rem)" }}
        >

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            {settings?.site_logo_url ? (
              <img
                src={settings.site_logo_url}
                alt={settings?.site_name ?? "شعار الموقع"}
                className="rounded-[var(--radius-md)] object-cover shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{ width: 36, height: 36 }}
                // @ts-ignore
                fetchPriority="high"
                decoding="async"
                width={36}
                height={36}
              />
            ) : (
              <div
                className="flex items-center justify-center rounded-[var(--radius-md)] shadow-sm transition-transform duration-200 group-hover:scale-105"
                style={{
                  width: 36, height: 36,
                  background: 'linear-gradient(135deg, var(--gold-600), var(--gold-400))',
                }}
                aria-hidden="true"
              >
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>أ</span>
              </div>
            )}
            <div className="hidden sm:block leading-none">
              <span
                className="block font-bold"
                style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', color: 'var(--text-primary)' }}
              >
                {settings?.site_name ?? "أمانات ومكتبة أسامة"}
              </span>
              <span
                className="block"
                style={{ fontSize: '0.6rem', letterSpacing: '0.10em', color: 'var(--gold-500)', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 700 }}
              >
                DIGITAL LIBRARY
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav aria-label="القائمة الرئيسية" className="hidden lg:flex items-center gap-0.5">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop Search ── */}
          <div ref={searchRef} className="hidden md:block flex-1" style={{ maxWidth: 280 }}>
            <form onSubmit={handleSearch}>
              <div className="input-wrap">
                <span className="input-icon" style={{ right: '0.75rem' }}>
                  <SearchIcon size={14} />
                </span>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="ابحث عن كتاب أو مؤلف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{ paddingRight: '2.25rem' }}
                  aria-label="بحث"
                />
              </div>
            </form>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <InstallAppButton className="hidden lg:flex" />
            <ThemeToggle />

            {isLoading ? (
              <div
                className="skeleton rounded-[var(--radius-md)]"
                style={{ width: 80, height: 36 }}
                aria-hidden="true"
              />
            ) : user ? (
              <div className="flex items-center gap-1">

                {/* Notifications */}
                <div className="relative" ref={notifsRef}>
                  <button
                    id="notifs-btn"
                    onClick={() => setShowNotifs(!showNotifs)}
                    aria-expanded={showNotifs}
                    aria-haspopup="true"
                    aria-label={`الإشعارات${unreadCount > 0 ? ` — ${unreadCount} غير مقروء` : ''}`}
                    className="touch-target flex items-center justify-center rounded-full relative transition-all duration-200"
                    style={{
                      width: 36, height: 36,
                      color: 'var(--text-secondary)',
                      background: showNotifs ? 'var(--accent-muted)' : 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-muted)')}
                    onMouseLeave={e => {
                      if (!showNotifs) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <BellIcon />
                    {unreadCount > 0 && (
                      <span
                        className="absolute flex items-center justify-center font-bold animate-pulse-ring"
                        style={{
                          top: 4, right: 4, width: 16, height: 16,
                          background: 'var(--crimson-500)', color: 'white',
                          fontSize: '0.5625rem', borderRadius: '50%',
                        }}
                        aria-hidden="true"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div
                      className="dropdown animate-fade-down"
                      style={{ position: 'absolute', left: 0, top: 'calc(100% + 8px)', width: 320 }}
                      role="menu"
                      aria-label="قائمة الإشعارات"
                    >
                      <div
                        className="flex items-center justify-between px-3 py-2.5"
                        style={{ borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}
                      >
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem' }}>
                          الإشعارات
                        </span>
                        {unreadCount > 0 && (
                          <span className="badge badge-gold">{unreadCount} جديد</span>
                        )}
                      </div>
                      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                            <div className="empty-state-icon" style={{ width: 48, height: 48 }}>
                              <BellIcon />
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>لا توجد إشعارات</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              role="menuitem"
                              tabIndex={0}
                              onClick={() => markRead(n.id, n.link)}
                              onKeyDown={e => e.key === 'Enter' && markRead(n.id, n.link)}
                              className="dropdown-item"
                              style={{
                                borderRadius: 0,
                                background: !n.isRead ? 'var(--accent-muted)' : 'transparent',
                                borderBottom: '1px solid var(--border)',
                                display: 'block',
                                padding: '0.625rem 0.875rem',
                              }}
                            >
                              <p
                                style={{
                                  fontSize: '0.8125rem',
                                  fontWeight: !n.isRead ? 700 : 400,
                                  lineHeight: 1.6,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {n.message}
                              </p>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', display: 'block', marginTop: 2 }}>
                                {new Date(n.createdAt).toLocaleDateString("ar-EG")}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <Link
                  href={dashboardLink}
                  className="hidden md:flex items-center gap-2 rounded-full px-2 py-1 transition-all duration-200"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    className="flex items-center justify-center rounded-full overflow-hidden font-bold"
                    style={{
                      width: 30, height: 30,
                      background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                      color: 'white', fontSize: '0.8125rem',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {user.name.split(" ")[0]}
                  </span>
                </Link>

                {/* Role shortcuts */}
                {user.role === "admin" && (
                  <Link href="/admin">
                    <button
                      className="btn btn-gold btn-sm hidden sm:inline-flex"
                      style={{ gap: '0.35rem', paddingInline: '0.75rem' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                      </svg>
                      <span className="hidden md:inline">لوحة الإدارة</span>
                    </button>
                  </Link>
                )}
                {user.role === "author" && (
                  <Link href="/author">
                    <button className="btn btn-ghost btn-sm hidden sm:inline-flex" style={{ paddingInline: '0.75rem' }}>
                      لوحتي
                    </button>
                  </Link>
                )}

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={logout}
                  style={{ paddingInline: '0.75rem', color: 'var(--text-tertiary)' }}
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login" className="hidden sm:block">
                  <button className="btn btn-ghost btn-sm" style={{ paddingInline: '0.875rem' }}>دخول</button>
                </Link>
                <Link href="/register">
                  <button className="btn btn-gold btn-sm" style={{ paddingInline: '0.875rem' }}>حساب جديد</button>
                </Link>
              </div>
            )}

            {/* Mobile Search */}
            <button
              className="md:hidden touch-target flex items-center justify-center rounded-full transition-all duration-200"
              style={{ width: 36, height: 36, color: 'var(--text-secondary)', background: 'transparent' }}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="بحث"
              aria-expanded={searchOpen}
            >
              <SearchIcon size={16} />
            </button>

            {/* Mobile Menu */}
            <button
              className="lg:hidden touch-target flex items-center justify-center rounded-full transition-all duration-200"
              style={{ width: 36, height: 36, color: 'var(--text-secondary)', background: mobileOpen ? 'var(--accent-muted)' : 'transparent' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="9" y1="17" x2="21" y2="17"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Search Overlay ── */}
        {searchOpen && (
          <div
            className="md:hidden animate-fade-down"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--bg)',
              padding: '0.75rem clamp(1rem, 4vw, 2rem)',
            }}
          >
            <form onSubmit={handleSearch}>
              <div className="input-wrap">
                <span className="input-icon" style={{ right: '0.875rem' }}>
                  <SearchIcon size={14} />
                </span>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="ابحث عن كتاب أو مؤلف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{ paddingRight: '2.5rem' }}
                  aria-label="بحث"
                />
              </div>
            </form>
          </div>
        )}

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <nav
            aria-label="القائمة الرئيسية للجوال"
            className="lg:hidden animate-fade-down"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--bg)',
              padding: '0.75rem clamp(1rem, 4vw, 2rem) 1.25rem',
            }}
          >
            <div className="flex flex-col gap-0.5">
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? "active" : ""}`}
                  style={{ display: 'block', textAlign: 'right', padding: '0.625rem 0.75rem' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {!user && (
              <div
                className="flex gap-2 mt-4 pt-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <Link href="/login" className="flex-1">
                  <button className="btn btn-ghost btn-sm w-full">دخول</button>
                </Link>
                <Link href="/register" className="flex-1">
                  <button className="btn btn-gold btn-sm w-full">حساب جديد</button>
                </Link>
              </div>
            )}
            
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <InstallAppButton className="w-full" variant="outline" />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
