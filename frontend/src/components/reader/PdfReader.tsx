"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  pdfUrl: string;
  bookId: number;
  initialPage?: number;
  onProgress?: (page: number, total: number) => void;
}

export default function PdfReader({ pdfUrl, bookId, initialPage = 1, onProgress }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const goTo = useCallback((page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    setCurrentPage(target);
    onProgress?.(target, numPages);
  }, [numPages, onProgress]);

  // Auto-fit to container width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth - 48;
        setScale(Math.min(w / 595, 1.5));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentPage + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(currentPage - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, goTo]);

  const progressPercent = numPages ? Math.round((currentPage / numPages) * 100) : 0;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-5xl">📄</div>
      <p className="text-[var(--text-muted)]">تعذّر تحميل ملف PDF</p>
      <p className="text-xs text-[var(--text-muted)]">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* ─── Controls Bar ─────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[var(--card-bg)]/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center gap-3">
        {/* Page Nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--border-color)] disabled:opacity-30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={currentPage}
              min={1}
              max={numPages}
              onChange={(e) => goTo(parseInt(e.target.value) || 1)}
              className="w-12 text-center text-sm bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] py-1 focus:outline-none focus:border-[var(--color-accent)]"
            />
            <span className="text-[var(--text-muted)] text-sm">/ {numPages || "—"}</span>
          </div>

          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--border-color)] disabled:opacity-30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2 mr-auto">
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.1))} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--border-color)] transition-colors text-lg font-bold">−</button>
          <span className="text-sm text-[var(--text-muted)] w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(2, s + 0.1))} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--border-color)] transition-colors text-lg font-bold">+</button>
        </div>
      </div>

      {/* ─── Progress Bar ─────────────────────────────── */}
      <div className="h-1 bg-[var(--border-color)]">
        <div
          className="h-1 bg-[var(--color-accent)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ─── PDF Document ─────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-[var(--background)] flex justify-center py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
            <p className="text-[var(--text-muted)] text-sm">جارٍ تحميل الكتاب...</p>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(err.message)}
          loading=""
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            className="shadow-[var(--shadow-md)] rounded-[var(--radius-md)] overflow-hidden"
            renderTextLayer
            renderAnnotationLayer
          />
        </Document>
      </div>

      {/* ─── Bottom Status ────────────────────────────── */}
      {!loading && (
        <div className="border-t border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>تقدمك: {progressPercent}%</span>
          <span>← → للتنقل بين الصفحات</span>
        </div>
      )}
    </div>
  );
}
