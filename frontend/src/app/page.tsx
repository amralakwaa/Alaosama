"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import BookCard from "@/components/ui/BookCard";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

export default function Home() {
  const router = useRouter();
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [freeBooks, setFreeBooks] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollY.current * 0.4}px)`;
        heroRef.current.style.opacity = `${1 - scrollY.current / 700}`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [premiumRes, freeRes, catRes, authorsRes] = await Promise.all([
          fetch(`${API}/books?isPremium=true&limit=4`),
          fetch(`${API}/books?isPremium=false&limit=4`),
          fetch(`${API}/categories/with-counts`),
          fetch(`${API}/authors?limit=4`),
        ]);
        const premiumData = await premiumRes.json();
        const freeData = await freeRes.json();
        const catData = await catRes.json();
        const authorsData = await authorsRes.json();

        if (premiumData.data) {
          setFeaturedBooks(premiumData.data.slice(0, 4));
        }
        if (freeData.data) {
          setFreeBooks(freeData.data.slice(0, 4));
        }

        const authorsArray = Array.isArray(authorsData) ? authorsData : authorsData.data || [];
        if (authorsArray.length > 0) {
          setAuthors(authorsArray.slice(0, 4).map((a: any) => ({
            id: a.id,
            name: a.name || "مؤلف",
            image: a.profileImage || a.avatar || null,
            bio: a.bio || "مؤلف في مكتبة أسامة.",
            books: a._count?.books || a.booksCount || 0,
            followers: a._count?.followers || a.followersCount || 0,
          })));
        }
        if (catData) setCategories(catData.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch homepage data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const freeSectionRef = useReveal();
  const premiumSectionRef = useReveal();
  const authorsSectionRef = useReveal();
  const catSectionRef = useReveal();
  const servicesSectionRef = useReveal();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0A0907] selection:bg-[#B8800A] selection:text-white font-body overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        
        {/* ════════════════════════════════════
            CINEMATIC HERO SECTION
        ════════════════════════════════════ */}
        <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center bg-[#FDFBF7] dark:bg-[#050403]">
          {/* Animated Background Layers */}
          <div className="absolute inset-0 z-0">
            {/* Base Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F0EBE1] via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1E1508] dark:via-[#050403] dark:to-[#050403] opacity-80"></div>
            
            {/* Dynamic Orbs */}
            <div className="absolute top-[20%] left-[15%] w-[40vw] h-[40vw] bg-[#B8800A]/15 dark:bg-[#B8800A]/10 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-[#2D6A4F]/15 dark:bg-[#2D6A4F]/10 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
            
            {/* Floating Books (Parallax Elements) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-[1000px]">
              <div className="absolute top-[15%] right-[15%] w-[120px] h-[180px] bg-black/5 dark:bg-white/5 rounded-md backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl transform rotate-y-[-20deg] rotate-x-[15deg] rotate-z-[10deg] animate-[float_6s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-[25%] left-[10%] w-[150px] h-[220px] bg-black/5 dark:bg-white/5 rounded-md backdrop-blur-sm border border-black/10 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl transform rotate-y-[30deg] rotate-x-[-10deg] rotate-z-[-5deg] animate-[float_8s_ease-in-out_infinite_1s]"></div>
              <div className="absolute top-[40%] right-[5%] w-[90px] h-[140px] bg-[#B8800A]/10 dark:bg-[#B8800A]/5 rounded-md backdrop-blur-md border border-[#B8800A]/20 shadow-[0_15px_30px_rgba(184,128,10,0.15)] dark:shadow-[0_0_30px_rgba(184,128,10,0.1)] transform rotate-y-[-40deg] rotate-x-[20deg] rotate-z-[15deg] animate-[float_7s_ease-in-out_infinite_2s]"></div>
            </div>

            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] mix-blend-multiply dark:mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
          </div>

          <div ref={heroRef} className="container relative z-10 mx-auto px-6 h-full flex flex-col justify-center items-center text-center mt-[-5vh]">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md mb-8 animate-[fade-down_1s_ease-out]">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8800A] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A030]"></span></span>
              <span className="text-[#B8800A] dark:text-[#D4A030] text-[11px] font-bold tracking-wider font-display uppercase">المنصة الثقافية الأولى في اليمن</span>
            </div>

            <h1 className="font-display font-black text-[#A08B6B] text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.1] tracking-tight max-w-[900px] mx-auto mb-6 animate-[fade-up_1s_ease-out_0.2s] drop-shadow-sm dark:drop-shadow-2xl">
              أمانات ومكتبة الاسامة<br/>
              <span className="font-serif italic font-medium text-[clamp(2rem,6vw,4rem)] text-[#B8800A] opacity-90 block mt-2 tracking-normal drop-shadow-none">A Premium Reading Experience</span>
            </h1>

            <p className="text-[#5C4D35] dark:text-[#A08B6B] text-[clamp(1rem,2vw,1.25rem)] max-w-[600px] mx-auto leading-relaxed mb-12 animate-[fade-up_1s_ease-out_0.4s]">
              ليست مجرد مكتبة، بل ملاذ رقمي لعشاق المعرفة. اكتشف آلاف الكتب، اقرأ بشغف، وانشر إبداعاتك مع دار النشر الخاصة بنا.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 animate-[fade-up_1s_ease-out_0.6s]">
              <Link href="/books">
                <button className="group relative overflow-hidden flex items-center justify-center gap-3 w-[220px] h-[60px] bg-gradient-to-r from-[#B8800A] to-[#D4A030] text-white rounded-full font-display font-bold text-[17px] shadow-[0_10px_30px_rgba(184,128,10,0.3)] dark:shadow-[0_10px_40px_rgba(184,128,10,0.4)] transition-transform duration-300 hover:scale-105 active:scale-95">
                  <span className="relative z-10 flex items-center gap-2">ابدأ القراءة <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></span>
                  <div className="absolute inset-0 bg-white/20 translate-x-full skew-x-12 group-hover:-translate-x-full transition-transform duration-700 ease-in-out"></div>
                </button>
              </Link>
              <Link href="/categories">
                <button className="group flex items-center justify-center gap-2 w-[220px] h-[60px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md text-[#0A0806] dark:text-white rounded-full font-display font-bold text-[17px] hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 active:scale-95">
                  استكشف المكتبة
                </button>
              </Link>
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute bottom-[5vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-[fade-in_1s_ease-out_1.5s]">
              <span className="text-[#A08B6B] dark:text-[#5C4D35] text-[10px] uppercase tracking-[0.2em] font-display font-bold">اكتشف</span>
              <div className="w-[1px] h-[40px] bg-gradient-to-b from-[#A08B6B] dark:from-[#5C4D35] to-transparent">
                <div className="w-[1px] h-[15px] bg-[#B8800A] animate-[fade-down_1.5s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            PREMIUM PAID BOOKS
        ════════════════════════════════════ */}
        <section ref={premiumSectionRef as any} className="py-24 sm:py-32 relative reveal-section">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-[600px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-[1px] bg-[#B8800A]"></div>
                  <span className="text-[#B8800A] text-[12px] font-bold tracking-[0.1em] uppercase font-display">الأكثر مبيعاً</span>
                </div>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-display font-black text-[#0A0806] dark:text-[#F5F0E8] leading-tight">
                  إصدارات <span className="font-serif italic text-[#B8800A] font-medium">فاخرة</span>
                </h2>
              </div>
              <Link href="/books?type=paid" className="group flex items-center gap-2 text-[#7A6548] dark:text-[#A08B6B] hover:text-[#B8800A] dark:hover:text-[#D4A030] font-display font-bold text-[13px] uppercase tracking-wider transition-colors pb-2 border-b border-transparent hover:border-[#B8800A]/30">
                عرض المتجر <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[400px] rounded-[24px] bg-[#E3D8C8]/20 dark:bg-[#1E1812]/20 animate-pulse"></div>)
                : featuredBooks.map((book: any, i) => (
                    <div key={book.id} style={{ transitionDelay: `${i * 100}ms` }} className="reveal-item">
                      <BookCard book={book} />
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            FREE BOOKS SECTION
        ════════════════════════════════════ */}
        <section ref={freeSectionRef as any} className="py-24 sm:py-32 relative bg-[#F9FBF9] dark:bg-[#070B09] border-y border-[#E2EFE7] dark:border-[#0E2018] reveal-section">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#2D6A4F 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-[600px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-[1px] bg-[#2D6A4F]"></div>
                  <span className="text-[#2D6A4F] dark:text-[#52B788] text-[12px] font-bold tracking-[0.1em] uppercase font-display">مبادرة ثقافية</span>
                </div>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-display font-black text-[#0A0806] dark:text-[#F5F0E8] leading-tight">
                  اقرأ <span className="font-serif italic text-[#2D6A4F] dark:text-[#52B788] font-medium">مجاناً</span>
                </h2>
              </div>
              <Link href="/books?type=free" className="group flex items-center gap-2 text-[#2D6A4F] font-display font-bold text-[13px] uppercase tracking-wider transition-colors pb-2 border-b border-transparent hover:border-[#2D6A4F]/30">
                المكتبة المجانية <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[400px] rounded-[24px] bg-[#E2EFE7]/50 dark:bg-[#0E2018]/50 animate-pulse"></div>)
                : freeBooks.map((book: any, i) => (
                    <div key={book.id} style={{ transitionDelay: `${i * 100}ms` }} className="reveal-item">
                      <BookCard book={book} />
                    </div>
                  ))}
            </div>

            <div className="mt-14 flex justify-center reveal-item">
              <Link href="/books">
                <button className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#2D6A4F] text-white rounded-full font-display font-bold text-[15px] hover:bg-[#1B3D2C] transition-all duration-300 shadow-[0_8px_24px_rgba(45,106,79,0.2)] hover:shadow-[0_12px_32px_rgba(45,106,79,0.3)]">
                  عرض جميع الكتب
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            AUTHORS SECTION
        ════════════════════════════════════ */}
        <section ref={authorsSectionRef as any} className="py-24 sm:py-32 relative reveal-section">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-[600px] mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-[1px] bg-[#B8800A]"></div>
                <span className="text-[#B8800A] text-[12px] font-bold tracking-[0.1em] uppercase font-display">أقلام خالدة</span>
                <div className="w-10 h-[1px] bg-[#B8800A]"></div>
              </div>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-display font-black text-[#0A0806] dark:text-[#F5F0E8] leading-tight mb-4">
                صنّاع <span className="font-serif italic text-[#B8800A] font-medium">المعرفة</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {authors.map((author, i) => (
                <div key={author.id} style={{ transitionDelay: `${i * 100}ms` }} className="reveal-item group relative bg-white dark:bg-[#14120E] rounded-[24px] p-6 border border-[#B8800A] dark:border-[#B8800A] hover:border-[#D4A030] dark:hover:border-[#D4A030] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(184,128,10,0.15)] flex flex-col items-center text-center overflow-hidden">
                  
                  {/* Decorative background circle */}
                  <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-[#FAF8F5] dark:bg-[#1A1814] rounded-full transition-transform duration-700 group-hover:scale-150 group-hover:bg-[#FFFBF2] dark:group-hover:bg-[#1E190D] z-0"></div>

                  <div className="relative z-10 w-24 h-24 rounded-full p-1 border border-[#E3D8C8] dark:border-[#3D3323] mb-4 bg-white dark:bg-[#0A0907] group-hover:border-[#B8800A] transition-colors duration-500">
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2C] flex items-center justify-center text-white text-3xl font-display overflow-hidden">
                      {author.image ? <Image src={author.image} alt={author.name} fill className="object-cover rounded-full" /> : author.name.charAt(0)}
                    </div>
                  </div>

                  <h3 className="relative z-10 font-display font-bold text-[18px] text-[#0A0806] dark:text-[#F5F0E8] mb-2">{author.name}</h3>
                  <p className="relative z-10 text-[12px] text-[#7A6548] dark:text-[#A08B6B] leading-relaxed mb-6 line-clamp-2">{author.bio}</p>

                  <div className="relative z-10 flex items-center justify-center gap-6 w-full mb-6 border-t border-[#F0EBE1] dark:border-[#2A241A] pt-4">
                    <div className="flex flex-col items-center">
                      <span className="font-display font-bold text-[16px] text-[#0A0806] dark:text-[#F5F0E8]">{author.books}</span>
                      <span className="text-[10px] text-[#A08B6B] uppercase tracking-wider">كتاب</span>
                    </div>
                    <div className="w-[1px] h-8 bg-[#F0EBE1] dark:bg-[#2A241A]"></div>
                    <div className="flex flex-col items-center">
                      <span className="font-display font-bold text-[16px] text-[#0A0806] dark:text-[#F5F0E8]">{author.followers}</span>
                      <span className="text-[10px] text-[#A08B6B] uppercase tracking-wider">متابع</span>
                    </div>
                  </div>

                  <button className="relative z-10 w-full h-11 rounded-full bg-[#FAF8F5] dark:bg-[#1A1814] text-[#B8800A] font-display font-bold text-[13px] hover:bg-[#B8800A] hover:text-white transition-all duration-300">
                    متابعة المؤلف
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-14 flex justify-center reveal-item">
              <Link href="/authors">
                <button className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#B8800A] text-white rounded-full font-display font-bold text-[15px] hover:bg-[#D4A030] transition-all duration-300 shadow-[0_8px_24px_rgba(184,128,10,0.2)] hover:shadow-[0_12px_32px_rgba(184,128,10,0.3)]">
                  عرض جميع المؤلفين
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            SERVICES - PREMIUM CARDS
        ════════════════════════════════════ */}
        <section ref={servicesSectionRef as any} className="py-24 sm:py-32 relative bg-[#FAF8F5] dark:bg-[#070B09] reveal-section overflow-hidden border-t border-[#F0EBE1] dark:border-[#152B20]">
          
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
             <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#B8800A]/5 rounded-full blur-[100px] pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#2D6A4F]/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-[600px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-[1px] bg-[#B8800A]"></div>
                  <span className="text-[#B8800A] text-[12px] font-bold tracking-[0.1em] uppercase font-display">عالم متكامل</span>
                </div>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-display font-black leading-tight text-[#0A0806] dark:text-[#F5F0E8]">
                  خدمات <span className="font-serif italic text-[#B8800A] font-medium">حصرية</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Publishing House Card */}
              <div className="lg:col-span-2 group relative rounded-[32px] bg-white dark:bg-[#14120E] border border-[#F0EBE1] dark:border-[#2A241A] shadow-xl hover:shadow-[0_24px_48px_rgba(184,128,10,0.12)] overflow-hidden p-8 sm:p-12 flex flex-col justify-center min-h-[400px] reveal-item transition-shadow duration-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#B8800A]/10 rounded-full blur-[60px] group-hover:bg-[#B8800A]/20 transition-colors duration-700"></div>
                
                <div className="relative z-10 max-w-[500px]">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B8800A] to-[#7A5200] text-white shadow-lg mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                  </div>
                  <h3 className="font-display font-black text-[32px] sm:text-[40px] mb-4 text-[#0A0806] dark:text-[#F5F0E8]">دار أسامة للنشر</h3>
                  <p className="text-[#7A6548] dark:text-[#A08B6B] text-[16px] leading-relaxed mb-10">نحول أفكارك إلى كتب خالدة. نقدم خدمات تدقيق، تصميم، طباعة، ونشر لتصل مخطوطتك إلى أيدي القراء بأعلى معايير الجودة.</p>
                  
                  <Link href="/publish">
                    <button className="flex items-center gap-3 w-fit px-8 h-[52px] bg-[#141008] dark:bg-[#F5F0E8] text-white dark:text-[#0A0806] rounded-full font-display font-bold text-[15px] hover:bg-[#B8800A] dark:hover:bg-[#D4A030] hover:text-white transition-all duration-300">
                      اطلب نشر كتابك <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                    </button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Amanat Service */}
                <div className="group relative rounded-[32px] bg-[#F2F8F5] dark:bg-[#0B1410] border border-[#E2EFE7] dark:border-[#152B20] overflow-hidden p-8 flex-1 flex flex-col justify-center reveal-item hover:shadow-[0_24px_48px_rgba(45,106,79,0.08)] transition-shadow duration-500" style={{ transitionDelay: '100ms' }}>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#2D6A4F]/10 rounded-full blur-[40px]"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center text-2xl mb-6">📦</div>
                    <h4 className="font-display font-bold text-[22px] text-[#2D6A4F] dark:text-[#52B788] mb-2">خدمات الأمانات</h4>
                    <p className="text-[#4F7361] dark:text-[#88A696] text-[13px] leading-relaxed mb-6">استلام وتسليم الطرود والأمانات الموثوقة بأعلى درجات الأمان والسرعة.</p>
                    <a href="https://wa.me/967779121514" className="inline-flex items-center gap-2 text-[#2D6A4F] dark:text-[#52B788] font-display font-bold text-[13px] hover:text-[#1B3D2C] transition-colors">تواصل الآن <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
                  </div>
                </div>

                {/* Supplies Service */}
                <div className="group relative rounded-[32px] bg-[#FAF7F2] dark:bg-[#1E1812] border border-[#E3D8C8] dark:border-[#3D3323] overflow-hidden p-8 flex-1 flex flex-col justify-center reveal-item hover:shadow-[0_24px_48px_rgba(184,128,10,0.08)] transition-shadow duration-500" style={{ transitionDelay: '200ms' }}>
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#B8800A]/10 rounded-full blur-[40px]"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#B8800A]/10 text-[#B8800A] dark:text-[#D4A030] flex items-center justify-center text-2xl mb-6">🖋️</div>
                    <h4 className="font-display font-bold text-[22px] text-[#B8800A] dark:text-[#D4A030] mb-2">المستلزمات التعليمية</h4>
                    <p className="text-[#7A6548] dark:text-[#C4AF92] text-[13px] leading-relaxed mb-6">قرطاسية، أدوات مكتبية وهندسية فاخرة تلبي احتياجاتك الاحترافية.</p>
                    <a href="https://wa.me/967779121514" className="inline-flex items-center gap-2 text-[#B8800A] dark:text-[#D4A030] font-display font-bold text-[13px] hover:text-[#7A5200] transition-colors">استعرض المنتجات <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Global styles for intersection observer animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .reveal-section .reveal-item {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-section.visible .reveal-item {
          opacity: 1;
          transform: translateY(0);
        }
      `}} />
    </div>
  );
}
