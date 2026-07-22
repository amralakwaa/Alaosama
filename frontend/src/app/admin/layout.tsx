"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRequireAuth } from "@/lib/auth/use-auth-redirect";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth("/login");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070B09] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#2D6A4F] border-t-transparent rounded-full" />
      </div>
    );
  }

  const navItems = [
    { name: "الإحصائيات", path: "/admin", icon: "📊" },
    { name: "الكتب", path: "/admin/books", icon: "📚" },
    { name: "التصنيفات", path: "/admin/categories", icon: "📑" },
    { name: "طلبات النشر", path: "/admin/publishing-requests", icon: "📝" },
    { name: "المؤلفون", path: "/admin/authors", icon: "✍️" },
    { name: "الخدمات", path: "/admin/services", icon: "📦" },
    { name: "المستخدمون", path: "/admin/users", icon: "👥" },
    { name: "التقييمات", path: "/admin/reviews", icon: "⭐" },
    { name: "سجل الأمان", path: "/admin/logs", icon: "🛡️" },
    { name: "الإعدادات", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070B09] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 md:py-12 gap-6 md:gap-10">
        {/* Sidebar */}
        <aside className="w-full md:w-[280px] flex-shrink-0">
          <div className="bg-white dark:bg-[#14120E] border border-[#E2EFE7] dark:border-[#152B20] rounded-[24px] p-5 md:sticky md:top-28 shadow-sm">
            <div className="mb-6 px-3">
              <h2 className="text-[20px] font-black font-display text-[#0A0806] dark:text-[#F5F0E8]">لوحة الإدارة</h2>
              <p className="text-[#A08B6B] dark:text-[#7A6548] text-[12px] mt-1.5 hidden md:block tracking-wide">التحكم الشامل بمنصة أسامة</p>
            </div>
            <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[16px] text-[13px] font-display font-bold transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "bg-[#2D6A4F] text-white shadow-[0_4px_12px_rgba(45,106,79,0.2)]"
                        : "text-[#7A6548] dark:text-[#A08B6B] hover:bg-[#E2EFE7]/50 dark:hover:bg-[#152B20]/50 hover:text-[#2D6A4F] dark:hover:text-[#2D6A4F]"
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
          <div className="bg-white dark:bg-[#14120E] border border-[#E2EFE7] dark:border-[#152B20] rounded-[24px] p-6 md:p-10 min-h-[700px] shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
