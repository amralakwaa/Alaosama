"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AuthorsListPage() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadAuthors = async (pageNum: number, isInitial = false) => {
    try {
      if (!isInitial) setLoadingMore(true);
      const res = await fetch(`${API}/authors?page=${pageNum}&limit=12`);
      const responseData = await res.json();
      
      // Handle the new paginated structure from the backend
      const newData = responseData.data || responseData;
      
      if (isInitial) {
        setAuthors(newData);
      } else {
        setAuthors(prev => [...prev, ...newData]);
      }
      
      // If we received fewer items than requested, we've reached the end
      if (newData.length < 12 || (responseData.meta && responseData.meta.page >= responseData.meta.totalPages)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadAuthors(1, true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadAuthors(nextPage, false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070B09]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-[#B8800A]/5 blur-3xl -z-10 h-full w-full rounded-full" />
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-[1px] bg-[#B8800A]"></div>
            <span className="text-[#B8800A] text-[12px] font-bold tracking-[0.1em] uppercase font-display">أقلام خالدة</span>
            <div className="w-10 h-[1px] bg-[#B8800A]"></div>
          </div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-display font-black text-[#0A0806] dark:text-[#F5F0E8] leading-tight mb-4">
            نخبة <span className="font-serif italic text-[#B8800A] font-medium">المؤلفين</span>
          </h1>
          <p className="text-[#7A6548] dark:text-[#A08B6B] max-w-2xl mx-auto text-lg leading-relaxed">
            تعرف على صناع المحتوى ورواد الفكر والمؤلفين الذين يساهمون في إثراء المحتوى العربي واليمني في مكتبة أسامة الرقمية.
          </p>
        </div>

        {/* Authors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#E3D8C8]/20 dark:bg-[#1E1812]/20 rounded-[24px] overflow-hidden h-[340px] animate-pulse" />
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#14120E] border border-dashed border-[#F0EBE1] dark:border-[#2A241A] rounded-[24px]">
            <span className="text-6xl block mb-4 opacity-50">✍️</span>
            <h2 className="text-xl font-display font-bold text-[#7A6548] dark:text-[#A08B6B]">لا يوجد مؤلفون متاحون حالياً</h2>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {authors.map((author, i) => (
                <Link
                  href={`/authors/${author.id}`}
                  key={author.id} 
                  className="group relative bg-white dark:bg-[#14120E] rounded-[24px] p-6 border border-[#B8800A] dark:border-[#B8800A] hover:border-[#D4A030] dark:hover:border-[#D4A030] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(184,128,10,0.15)] flex flex-col items-center text-center overflow-hidden"
                >
                  {/* Decorative background circle */}
                  <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-[#FAF8F5] dark:bg-[#1A1814] rounded-full transition-transform duration-700 group-hover:scale-150 group-hover:bg-[#FFFBF2] dark:group-hover:bg-[#1E190D] z-0"></div>

                  <div className="relative z-10 w-24 h-24 rounded-full p-1 border border-[#E3D8C8] dark:border-[#3D3323] mb-4 bg-white dark:bg-[#0A0907] group-hover:border-[#B8800A] transition-colors duration-500">
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2C] flex items-center justify-center text-white text-3xl font-display overflow-hidden">
                      {author.image || author.avatar ? (
                        <Image src={author.image || author.avatar} alt={author.name} fill className="object-cover rounded-full" />
                      ) : (
                        author.name.charAt(0)
                      )}
                    </div>
                  </div>

                  <h3 className="relative z-10 font-display font-bold text-[18px] text-[#0A0806] dark:text-[#F5F0E8] mb-2">{author.name}</h3>
                  <p className="relative z-10 text-[12px] text-[#7A6548] dark:text-[#A08B6B] leading-relaxed mb-6 line-clamp-2">{author.bio}</p>

                  <div className="relative z-10 flex items-center justify-center gap-6 w-full mb-6 border-t border-[#F0EBE1] dark:border-[#2A241A] pt-4">
                    <div className="flex flex-col items-center">
                      <span className="font-display font-bold text-[16px] text-[#0A0806] dark:text-[#F5F0E8]">{author.bookCount || author.books || 0}</span>
                      <span className="text-[10px] text-[#A08B6B] uppercase tracking-wider">كتاب</span>
                    </div>
                    <div className="w-[1px] h-8 bg-[#F0EBE1] dark:bg-[#2A241A]"></div>
                    <div className="flex flex-col items-center">
                      <span className="font-display font-bold text-[16px] text-[#0A0806] dark:text-[#F5F0E8]">{author.followersCount || author.followers || 0}</span>
                      <span className="text-[10px] text-[#A08B6B] uppercase tracking-wider">متابع</span>
                    </div>
                  </div>

                  <button className="relative z-10 w-full h-11 rounded-full bg-[#FAF8F5] dark:bg-[#1A1814] text-[#B8800A] font-display font-bold text-[13px] hover:bg-[#B8800A] hover:text-white transition-all duration-300">
                    متابعة المؤلف
                  </button>
                </Link>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#141008] dark:bg-[#F5F0E8] text-white dark:text-[#0A0806] rounded-full font-display font-bold text-[15px] hover:bg-[#B8800A] dark:hover:bg-[#D4A030] hover:text-white transition-all duration-300 shadow-[0_8px_24px_rgba(20,16,8,0.12)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'جاري التحميل...' : 'عرض المزيد من المؤلفين'}
                  {!loadingMore && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-1"><path d="M6 9l6 6 6-6"/></svg>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}