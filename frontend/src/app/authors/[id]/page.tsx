"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import BookCard from "@/components/ui/BookCard";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const authorId = resolvedParams.id;
  
  const { user, accessToken, showAuthModal } = useAuth();
  const [author, setAuthor] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const loadAuthorData = async () => {
      try {
        // Fetch author profile
        const profileRes = await fetch(`${API}/authors/${authorId}/profile`);
        if (!profileRes.ok) throw new Error("مؤلف غير موجود");
        const profileData = await profileRes.json();
        
        setAuthor(profileData);
        setBooks(profileData.books || []);

        // Check if current user follows this author
        if (user && accessToken) {
          const followedRes = await fetch(`${API}/authors/followed`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const followedData = await followedRes.json();
          setIsFollowing(followedData.some((a: any) => a.id.toString() === authorId));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAuthorData();
  }, [authorId, user, accessToken]);

  const toggleFollow = async () => {
    if (!user || !accessToken) {
      showAuthModal(
        () => toggleFollow(), // retry after login
        "سجّل دخولك لمتابعة هذا المؤلف وتلقّي إشعارات عند إصدار كتب جديدة"
      );
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await fetch(`${API}/authors/${authorId}/follow`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setIsFollowing(false);
        setAuthor((prev: any) => ({...prev, followersCount: (prev.followersCount || 1) - 1}));
      } else {
        await fetch(`${API}/authors/${authorId}/follow`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setIsFollowing(true);
        setAuthor((prev: any) => ({...prev, followersCount: (prev.followersCount || 0) + 1}));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Derive some virtual sections from books
  const latestBooks = [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const topBooks = [...books].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-8">
            <div className="h-64 bg-[var(--border-color)] rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({length: 4}).map((_, i) => <div key={i} className="aspect-[2/3] bg-[var(--border-color)] rounded-lg" />)}
            </div>
          </div>
        ) : !author ? (
          <div className="text-center py-20">لم يتم العثور على المؤلف</div>
        ) : (
          <>
            {/* ─── Digital Library Profile Header ──────────────────────── */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-6 md:p-10 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--color-primary)]/10 to-transparent z-0" />
              
              <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full flex items-center justify-center text-6xl shrink-0 border-4 border-[var(--background)] shadow-lg overflow-hidden">
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.name} 
                    className="w-full h-full object-cover"
                    width={160}
                    height={160}
                  />
                ) : '✍️'}
              </div>
              
              <div className="relative z-10 text-center md:text-right flex-1 flex flex-col h-full justify-center">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
                      {author.name}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-[var(--text-muted)]">
                      {author.location && <span className="flex items-center gap-1">📍 {author.location}</span>}
                      <span className="flex items-center gap-1">📅 انضم في {new Date(author.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                  
                  {/* Follow Button */}
                  <Button 
                    variant={isFollowing ? "ghost" : "accent"} 
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`min-w-[140px] ${isFollowing ? 'border border-[var(--color-accent)] text-[var(--color-accent)]' : ''}`}
                  >
                    {isFollowing ? '✔️ متابَع' : '🔔 متابعة المؤلف'}
                  </Button>
                </div>

                <p className="text-[var(--text-muted)] leading-relaxed max-w-3xl mb-6">
                  {author.bio || "مؤلف في مكتبة أسامة الرقمية."}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold">
                  <div className="bg-[var(--background)] border border-[var(--border-color)] px-4 py-2 rounded-lg text-center min-w-[100px]">
                    <div className="text-[var(--color-primary)] text-xl mb-1">{books.length}</div>
                    <div className="text-[var(--text-muted)] text-xs">كتاب منشور</div>
                  </div>
                  <div className="bg-[var(--background)] border border-[var(--border-color)] px-4 py-2 rounded-lg text-center min-w-[100px]">
                    <div className="text-[var(--color-accent)] text-xl mb-1">{author.followersCount || 0}</div>
                    <div className="text-[var(--text-muted)] text-xs">متابع</div>
                  </div>
                  {(author.averageRating > 0) && (
                    <div className="bg-[var(--background)] border border-[var(--border-color)] px-4 py-2 rounded-lg text-center min-w-[100px]">
                      <div className="flex items-center gap-1 justify-center text-xl mb-1" style={{ color: "var(--color-accent)" }}>
                        <span>{author.averageRating?.toFixed ? author.averageRating.toFixed(1) : author.averageRating}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                      <div className="text-[var(--text-muted)] text-xs">متوسط التقييم</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Latest Releases ──────────────────────────────────────── */}
            {latestBooks.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6 flex items-center gap-2">
                  <span>✨</span> أحدث الإصدارات
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {latestBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Top Books ────────────────────────────────────────────── */}
            {topBooks.length > 0 && books.length > 4 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6 flex items-center gap-2">
                  <span>🔥</span> الأكثر شهرة للمؤلف
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {topBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── All Books ────────────────────────────────────────────── */}
            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-6 flex items-center gap-2">
                <span>📚</span> جميع المؤلفات ({books.length})
              </h2>
              {books.length === 0 ? (
                <div className="text-center py-20 text-[var(--text-muted)] border border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)]">
                  لا توجد كتب منشورة لهذا المؤلف حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
