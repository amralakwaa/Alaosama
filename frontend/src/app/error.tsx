"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-6 text-center gap-6">
      <div className="text-6xl" aria-hidden="true">⚠️</div>
      <div>
        <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-2">
          حدث خطأ غير متوقع
        </h2>
        <p className="text-[var(--text-muted)] text-sm max-w-sm">
          نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="accent" size="md" onClick={reset}>
          حاول مجدداً
        </Button>
        <a href="/">
          <Button variant="ghost" size="md">الصفحة الرئيسية</Button>
        </a>
      </div>
    </div>
  );
}
