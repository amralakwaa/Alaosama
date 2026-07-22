"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRequireAuth } from "@/lib/auth/use-auth-redirect";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth("/login");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && user && user.role !== "author" && user.role !== "admin") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const navItems = [
    { name: "نظرة عامة", path: "/author", icon: "📊" },
    { name: "مؤلفاتي", path: "/author/books", icon: "📚" },
    { name: "طلب نشر جديد", path: "/author/publish-request", icon: "📝" },
    { name: "الملف الشخصي", path: "/author/profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 gap-6 md:gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-4 md:sticky md:top-24">
            <div className="mb-4 md:mb-6 px-2 text-center md:text-right flex items-center md:flex-col gap-4 md:gap-0">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full flex items-center justify-center text-2xl md:text-3xl md:mx-auto md:mb-3 flex-shrink-0">
                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : '✍️'}
              </div>
              <div className="text-right md:text-center">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)]">{user.name}</h2>
                <p className="text-[var(--text-muted)] text-xs mt-1">لوحة المؤلف</p>
              </div>
            </div>
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar mt-2 md:mt-0">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "text-[var(--text-muted)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 min-h-[600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
