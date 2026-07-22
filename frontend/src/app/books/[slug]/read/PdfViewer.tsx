"use client"; 

import { useEffect, useRef, useState, useCallback } from "react";

interface PdfViewerProps {
  pdfUrl: string;
  bookTitle: string;
}

const PDFJS_CDN = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js";
const WORKER_CDN = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default function PdfViewer({ pdfUrl, bookTitle }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.4);
  const [isRendering, setIsRendering] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Step 1: Load PDF.js from CDN (unpkg primary, cdnjs fallback)
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = WORKER_CDN;
      setPdfjsLib(lib);
      return;
    }

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed: ${src}`));
        document.head.appendChild(script);
      });

    loadScript(PDFJS_CDN)
      .catch(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"))
      .then(() => {
        const lib = (window as any).pdfjsLib;
        if (!lib) throw new Error("pdfjsLib not found after load");
        lib.GlobalWorkerOptions.workerSrc = WORKER_CDN;
        setPdfjsLib(lib);
      })
      .catch(() => setLoadError("فشل تحميل محرك PDF. تحقق من الاتصال بالإنترنت."));
  }, []);

  // Step 2: Load PDF document
  useEffect(() => {
    if (!pdfjsLib || !pdfUrl) return;
    setLoadError("");
    pdfjsLib
      .getDocument({ url: pdfUrl, withCredentials: false })
      .promise.then((pdfDoc: any) => {
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setPageNumber(1);
      })
      .catch((err: any) => {
        setLoadError(err?.message || "فشل تحميل الكتاب");
      });
  }, [pdfjsLib, pdfUrl]);

  // Step 3: Render current page on canvas
  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;

    // Cancel any ongoing render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setIsRendering(true);
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Render error:", err);
      }
    } finally {
      setIsRendering(false);
    }
  }, [pdf, pageNumber, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handleNext = () => { if (pageNumber < numPages) setPageNumber((p) => p + 1); };
  const handlePrev = () => { if (pageNumber > 1) setPageNumber((p) => p - 1); };
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-red-400">
        <div className="text-4xl">⚠️</div>
        <p>{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* PDF Canvas Area */}
      <div className="flex-1 overflow-auto custom-pdf-scrollbar flex justify-center items-start py-6 px-4 bg-[#0d1321]">
        {!pdf ? (
          <div className="flex flex-col items-center gap-3 mt-24">
            <div className="w-10 h-10 border-4 border-[var(--color-accent,#10b981)] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/50 text-sm">جاري تحميل الكتاب...</p>
          </div>
        ) : (
          <div className="relative">
            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0d1321]/60 rounded z-10">
                <div className="w-6 h-6 border-2 border-white/30 border-t-[var(--color-accent,#10b981)] rounded-full animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="block rounded shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-w-full"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
      </div>

      {/* Controls Bar */}
      {numPages > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/5" dir="ltr">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-1 py-1 border border-white/5">
            <button onClick={handleZoomOut} className="p-2 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
            </button>
            <span className="text-xs text-white/40 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-2 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-3">
            <button onClick={handlePrev} disabled={pageNumber <= 1} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm text-white/70 font-medium min-w-[5rem] text-center">
              {pageNumber} / {numPages}
            </span>
            <button onClick={handleNext} disabled={pageNumber >= numPages} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Page indicator (decorative) */}
          <div className="text-xs text-white/30 hidden sm:block">
            {bookTitle}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-pdf-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-pdf-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        .custom-pdf-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-pdf-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
