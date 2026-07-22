export default function Loading() {
  return (
    <div role="status" aria-label="جار التحميل" className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-white font-bold text-xl">أ</span>
          </div>
          <div className="absolute inset-0 rounded-[var(--radius-lg)] border-2 border-[var(--color-accent)] animate-ping opacity-30" />
        </div>
        <p className="text-[var(--text-muted)] text-sm">جارٍ التحميل...</p>
      </div>
    </div>
  );
}
