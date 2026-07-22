"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-6 text-center">
      {/* Animated 404 */}
      <div className="relative mb-8">
        <div className="text-[10rem] font-black font-[family-name:var(--font-display)] leading-none text-[var(--border-color)] select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce">
          📚
        </div>
      </div>

      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-3">
        الصفحة غير موجودة
      </h1>
      <p className="text-[var(--text-muted)] mb-8 max-w-sm">
        يبدو أن هذه الصفحة أُزيلت أو لم تكن موجودة أصلاً. ربما ستجد ما تبحث عنه في المكتبة.
      </p>

      <div className="flex gap-3">
        <Link href="/">
          <Button variant="accent" size="md">العودة للرئيسية</Button>
        </Link>
        <Link href="/books">
          <Button variant="ghost" size="md">تصفّح المكتبة</Button>
        </Link>
      </div>
    </div>
  );
}
