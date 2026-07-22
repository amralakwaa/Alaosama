"use client";

import { use, useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import dynamic from "next/dynamic";

// Load PdfViewer ONLY on client (ssr: false) — fixes pdfjs Object.defineProperty error
const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      <p className="text-white/60 text-sm">جاري تجهيز القارئ...</p>
    </div>
  ),
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = API.replace("/api", "");

interface BookBasic {
  id: number;
  title: string;
  slug: string;
  coverImageUrl?: string;
  isPremium: boolean;
  author?: { name: string };
}

export default function ReadBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { accessToken } = useAuth();

  const [book, setBook] = useState<BookBasic | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/books/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("الكتاب غير موجود");
        return r.json();
      })
      .then(async (data: BookBasic) => {
        setBook(data);
        const headers: Record<string, string> = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const res = await fetch(`${API}/books/${data.id}/download-url`, { headers });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "لا يمكن تحميل ملف الكتاب");
        }
        const { url } = await res.json();
        setPdfUrl(url);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, accessToken]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0f1c]">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full" />
        <p className="text-white/60 font-medium">جاري تجهيز بيئة القراءة...</p>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0a0f1c] px-4" dir="rtl">
        <div className="w-24 h-24 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-center text-white">{error}</h1>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/login" className="px-8 py-3 bg-[var(--color-accent)] text-white rounded-xl font-bold transition-all">تسجيل الدخول</Link>
          <Link href={`/books/${slug}`} className="px-8 py-3 border border-white/10 hover:bg-white/5 text-white rounded-xl font-bold transition-all">العودة للكتاب</Link>
        </div>
      </div>
    );
  }

  // ─── Reader Layout ───────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-[#0a0f1c] text-white overflow-hidden" dir="rtl">

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href={`/books/${slug}`}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white group"
            title="العودة للكتاب"
          >
            <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <div className="h-8 w-px bg-white/10 mx-1" />

          {book?.coverImageUrl && (
            <img
              src={book.coverImageUrl.startsWith("http") ? book.coverImageUrl : `${API_BASE}${book.coverImageUrl}`}
              alt={book?.title}
              className="w-8 h-11 object-cover rounded shadow-lg hidden sm:block"
            />
          )}
          <div>
            <h1 className="font-bold text-sm leading-tight max-w-[200px] md:max-w-sm truncate text-white">{book?.title}</h1>
            {book?.author && <p className="text-xs text-[var(--color-accent)] mt-0.5">{book.author.name}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2" dir="ltr">
          {/* Download */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${book?.title}.pdf`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              تحميل
            </a>
          )}

          {/* Full Screen */}
          <button
            onClick={toggleFullScreen}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white transition-colors"
            title="ملء الشاشة"
          >
            {isFullScreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20H5v-4M15 20h4v-4M9 4H5v4M15 4h4v4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* PDF Viewer — loaded only on client */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {pdfUrl ? (
          <PdfViewer pdfUrl={pdfUrl} bookTitle={book?.title ?? ""} />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-white/40 gap-4">
            <div className="text-6xl">📄</div>
            <p className="text-lg">الملف غير متاح حالياً</p>
          </div>
        )}
      </main>
    </div>
  );
}