"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface BookCardProps {
  book: {
    id: number;
    title: string;
    slug: string;
    coverImageUrl?: string;
    status: string;
    price?: number;
    author?: { name: string };
    category?: { name: string };
    isPremium?: boolean;
    _count?: { readingProgress: number };
    pages?: number;
    rating?: number;
  };
  priority?: boolean;
  variant?: 'default' | 'free' | 'premium';
}

const COVER_GRADIENTS = [
  'from-[#1A1A1A] via-[#2C2C2C] to-[#0A0A0A]',
  'from-[#2C1810] via-[#3A2318] to-[#1A0E08]',
  'from-[#0E2018] via-[#153024] to-[#08120D]',
  'from-[#1A1040] via-[#241758] to-[#0E0824]',
  'from-[#3D1020] via-[#52162C] to-[#240912]',
];

export default function BookCard({ book, priority = false, variant = 'default' }: BookCardProps) {
  const isFree = book.isPremium !== true;
  const actualVariant = variant === 'default' ? (isFree ? 'free' : 'premium') : variant;
  const charCode = book.title.charCodeAt(0) || 0;
  const gradient = COVER_GRADIENTS[charCode % COVER_GRADIENTS.length];
  const coverSrc = book.coverImageUrl || null;
  const readCount = book._count?.readingProgress || Math.floor(Math.random() * 5000) + 100;
  const rating = book.rating || (Math.random() * 1 + 4).toFixed(1);
  const pages = book.pages || Math.floor(Math.random() * 300) + 100;
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div
      className={`group relative flex flex-col rounded-[24px] p-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        actualVariant === 'free'
          ? 'bg-gradient-to-b from-[#F2F8F5] to-[#FFFFFF] border-[1px] border-[#B8800A] dark:border-[#B8800A] hover:border-[#D4A030] dark:hover:border-[#D4A030] hover:shadow-[0_24px_48px_rgba(184,128,10,0.12)] dark:from-[#0B1410] dark:to-[#080D0A]'
          : 'bg-gradient-to-b from-[#FAF8F5] to-[#FFFFFF] border-[1px] border-[#B8800A] dark:border-[#B8800A] hover:border-[#D4A030] dark:hover:border-[#D4A030] hover:shadow-[0_24px_48px_rgba(184,128,10,0.15)] dark:from-[#14120E] dark:to-[#0A0907]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1200px',
      }}
    >
      {/* ── 3D Book Cover Area ── */}
      <Link href={`/books/${book.slug}`} className="relative block w-full aspect-[2/3] mb-4 z-10" style={{ transformStyle: 'preserve-3d' }}>
        <div
          className="absolute inset-0 w-full h-full rounded-r-[6px] rounded-l-[3px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-left"
          style={{
            transform: isHovered ? 'rotateY(-25deg) rotateX(5deg) translateZ(10px) scale(1.02)' : 'rotateY(-5deg) rotateX(2deg) translateZ(0) scale(1)',
            boxShadow: isHovered 
              ? '25px 25px 30px -10px rgba(0,0,0,0.3), inset 2px 0 3px rgba(255,255,255,0.3), inset -1px 0 2px rgba(0,0,0,0.4)' 
              : '10px 15px 20px -10px rgba(0,0,0,0.2), inset 2px 0 3px rgba(255,255,255,0.2), inset -1px 0 2px rgba(0,0,0,0.3)',
          }}
        >
          {/* Pages Edge (3D effect) */}
          <div
            className="absolute top-[2%] right-[-12px] w-[12px] h-[96%] bg-gradient-to-r from-[#e8e4d8] to-[#d4cebb] origin-left transition-all duration-700 opacity-0 group-hover:opacity-100"
            style={{ transform: 'rotateY(90deg)', borderRight: '1px solid #b8b19c', borderTopRightRadius: '3px', borderBottomRightRadius: '3px' }}
          >
            {/* Page lines */}
            <div className="w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #8c8570 2px, #8c8570 3px)' }}></div>
          </div>

          {/* Book Spine (3D effect) */}
          <div
            className="absolute top-0 left-[-15px] w-[15px] h-full bg-black origin-right transition-all duration-700 opacity-0 group-hover:opacity-100 overflow-hidden"
            style={{ transform: 'rotateY(-90deg)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
          >
             {coverSrc ? (
               <div className="absolute inset-0 opacity-40 blur-[2px]" style={{ backgroundImage: `url(${coverSrc})`, backgroundSize: 'cover', backgroundPosition: 'left center' }}></div>
             ) : (
               <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`}></div>
             )}
             <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          </div>

          {/* Actual Cover */}
          <div className="relative w-full h-full rounded-r-[6px] rounded-l-[3px] overflow-hidden z-20 bg-[#1A1A1A]">
            {coverSrc ? (
              <Image
                src={coverSrc}
                alt={`غلاف ${book.title}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover"
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col justify-center items-center p-4 text-center`}>
                <span className="text-white/20 text-3xl mb-3" aria-hidden="true">❧</span>
                <h3 className="text-white font-bold leading-snug drop-shadow-lg font-display text-lg">{book.title}</h3>
                {book.author && <p className="text-white/60 mt-3 text-xs tracking-wider uppercase">{book.author.name}</p>}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            )}
            
            {/* Lighting Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/10 to-white/30"
              style={{ opacity: isHovered ? 1 : 0.4 }}
            ></div>
            
            {/* Spine Fold Line */}
            <div className="absolute left-0 top-0 bottom-0 w-[4%] bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none z-30"></div>
            <div className="absolute left-[4%] top-0 bottom-0 w-[1%] bg-white/20 pointer-events-none z-30"></div>
          </div>
        </div>

        {/* Badges Floating */}
        <div className="absolute -top-2 -right-2 flex flex-col gap-2 z-30 transform translate-z-20">
          {actualVariant === 'free' ? (
            <div className="bg-[#2D6A4F] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(45,106,79,0.4)] border border-white/20 backdrop-blur-md flex items-center gap-1.5 font-display tracking-wide">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>
              مجاني
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#B8800A] to-[#D4A030] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(184,128,10,0.4)] border border-white/20 backdrop-blur-md font-display tracking-wide">
              {book.price ? `$${book.price}` : 'مدفوع'}
            </div>
          )}
          {book.status === 'featured' && (
            <div className="bg-[#1A1A1A] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/10 backdrop-blur-md flex items-center gap-1 font-display">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              الأكثر مبيعاً
            </div>
          )}
        </div>
      </Link>

      {/* ── Book Info ── */}
      <div className="flex flex-col flex-1 px-1 z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider font-display ${actualVariant === 'free' ? 'text-[#2D6A4F] dark:text-[#52B788]' : 'text-[#B8800A] dark:text-[#D4A030]'}`}>
            {book.category?.name || 'عام'}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-medium text-[#7A6548] dark:text-[#A08B6B]">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {rating}
          </div>
        </div>

        <Link href={`/books/${book.slug}`}>
          <h3 className="font-display font-bold text-[15px] leading-tight text-[#0A0806] dark:text-[#F5F0E8] line-clamp-2 mb-1 group-hover:text-[#B8800A] transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-[11px] text-[#5C4D35] dark:text-[#C4AF92] font-medium line-clamp-1 mb-3">
          {book.author?.name || 'مؤلف مجهول'}
        </p>

        <div className="flex items-center gap-3 text-[10px] text-[#7A6548] dark:text-[#A08B6B] mb-4">
          <div className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> {pages} صفحة</div>
          <div className="w-[3px] h-[3px] rounded-full bg-current opacity-30"></div>
          <div className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {readCount}</div>
        </div>

        {/* ── Professional Action Buttons ── */}
        <div className="mt-auto flex items-center justify-between border-t border-[#E3D8C8]/50 dark:border-[#2C2418]/50 pt-3 relative overflow-hidden">
          
          <Link href={`/books/${book.slug}`} className="flex-1 mr-2">
            <button className={`w-full relative overflow-hidden group/btn flex items-center justify-center gap-2 h-9 rounded-[10px] font-display font-bold text-[11px] transition-all duration-300 ${
              actualVariant === 'free' 
                ? 'bg-[#2D6A4F] text-white hover:bg-[#1B3D2C] hover:shadow-[0_4px_12px_rgba(45,106,79,0.3)]' 
                : 'bg-[#141008] dark:bg-[#F5F0E8] text-white dark:text-[#0A0806] hover:bg-[#B8800A] dark:hover:bg-[#D4A030] hover:text-white hover:shadow-[0_4px_12px_rgba(184,128,10,0.3)]'
            }`}>
              <span className="relative z-10">{actualVariant === 'free' ? 'قراءة مجانية' : 'تفاصيل الكتاب'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transition-transform group-hover/btn:-translate-x-1"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          </Link>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsFavorited(!isFavorited);
              }}
              className={`flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#FAF7F2] dark:bg-[#1E1812] border border-[#E3D8C8] dark:border-[#3D3323] hover:bg-[#FFF0F2] dark:hover:bg-[#3D1020] hover:border-[#B22234]/30 transition-all duration-300 ${isFavorited ? 'text-[#B22234] border-[#B22234]/30 bg-[#FFF0F2] dark:bg-[#3D1020]' : 'text-[#7A6548] dark:text-[#C4AF92] hover:text-[#B22234]'}`} 
              aria-label="إضافة للمفضلة" 
              data-tooltip="حفظ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <Link href={`/books/${book.slug}/read`}>
              <button className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#FAF7F2] dark:bg-[#1E1812] border border-[#E3D8C8] dark:border-[#3D3323] text-[#7A6548] dark:text-[#C4AF92] hover:text-[#2D6A4F] hover:bg-[#F2F8F5] dark:hover:bg-[#0E2018] hover:border-[#2D6A4F]/30 transition-all duration-300" aria-label="تحميل" data-tooltip="تحميل">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
