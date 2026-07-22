"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AuthorBooksPage() {
  const { accessToken, user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !user) return;
    const loadBooks = async () => {
      try {
        // Fetching books for the author (ideally an endpoint like /books/author/my-books)
        // For now, we'll fetch all and filter by authorId = user.id
        const res = await fetch(`${API}/books/admin/all`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const data = await res.json();
        const myBooks = (data.data || []).filter((b: any) => b.author?.id === user.id);
        setBooks(myBooks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [accessToken, user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">مؤلفاتي</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">إدارة كتبك المنشورة ومتابعة تفاعلها</p>
        </div>
        <Link href="/author/publish-request">
          <Button variant="accent">طلب نشر كتاب جديد</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>جاري التحميل...</div>
        ) : books.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[var(--background)] border border-[var(--border-color)] border-dashed rounded-[var(--radius-lg)]">
            <span className="text-4xl mb-3 block">📚</span>
            <p className="text-[var(--text-muted)] font-medium">ليس لديك أي كتب منشورة حتى الآن.</p>
          </div>
        ) : (
          books.map(book => (
            <div key={book.id} className="bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col">
              <div className="h-40 bg-gradient-to-br from-purple-500 to-indigo-600 relative">
                {book.coverImage && <img src={book.coverImage} className="w-full h-full object-cover opacity-50 mix-blend-overlay" />}
                <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-bold text-lg font-[family-name:var(--font-display)] leading-tight">{book.title}</h3>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">الحالة:</span>
                  <span className={`font-bold ${book.status === 'published' || book.status === 'featured' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {book.status === 'published' || book.status === 'featured' ? 'منشور' : 'قيد المراجعة'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)]">التحميلات:</span>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
