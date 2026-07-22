"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = API.replace('/api', '');

export default function AdminBooksPage() {
  const { accessToken } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadBooks = async (status = "all") => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const url = status === "all" ? `${API}/books/admin/all` : `${API}/books/admin/all?status=${status}`;
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
      });
      const data = await res.json();
      setBooks(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBooks(filter);
    loadCategories();
  }, [filter, accessToken]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetch(`${API}/admin/books/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
      loadBooks(filter);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeature = async (id: number, currentFeatured: boolean) => {
    try {
      await fetch(`${API}/admin/books/${id}/feature`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      loadBooks(filter);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف النهائي لهذا الكتاب؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await fetch(`${API}/books/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      loadBooks(filter);
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">إدارة الكتب</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">تعديل وحذف ومراجعة الكتب المضافة</p>
        </div>
        <Link href="/admin/books/new">
          <Button variant="accent">+ إضافة كتاب جديد</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "الكل" },
          { key: "pending", label: "بانتظار المراجعة" },
          { key: "approved", label: "منشور" },
          { key: "rejected", label: "مرفوض" },
          { key: "archived", label: "مؤرشف" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              filter === f.key
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--background)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[var(--background)] rounded-[var(--radius-lg)] border border-[var(--border-color)]">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-[var(--text-muted)] uppercase border-b border-[var(--border-color)]">
            <tr>
              <th className="px-4 py-3">الغلاف</th>
              <th className="px-4 py-3">الكتاب</th>
              <th className="px-4 py-3">المؤلف</th>
              <th className="px-4 py-3">التصنيف</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3 text-center">مميز</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">جاري التحميل...</td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-[var(--text-muted)]">لا توجد كتب مطابقة.</td></tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-bg-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-14 bg-[var(--border-color)] rounded overflow-hidden shrink-0">
                      {book.coverImageUrl ? (
                        <img 
                          src={book.coverImageUrl}
                          alt={book.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)]">بدون</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold">{book.title}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{book.author?.name || "مجهول"}</td>
                  <td className="px-4 py-3 text-[var(--color-accent)]">{book.category?.name || "بدون"}</td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-[var(--card-bg)] border border-[var(--border-color)] text-xs rounded p-1 font-bold"
                      value={book.status}
                      onChange={(e) => handleStatusChange(book.id, e.target.value)}
                    >
                      <option value="pending">مراجعة</option>
                      <option value="approved">نشر</option>
                      <option value="rejected">رفض</option>
                      <option value="archived">أرشفة</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleFeature(book.id, book.isFeatured)}
                      className={`text-xl transition-transform hover:scale-110 ${book.isFeatured ? 'text-yellow-500' : 'text-[var(--border-color)] hover:text-yellow-500/50'}`}
                      title={book.isFeatured ? "إلغاء التمييز" : "تمييز الكتاب"}
                    >
                      ★
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/admin/books/${book.id}/edit`} className="text-blue-500 hover:underline">تعديل</Link>
                    <button onClick={() => handleDelete(book.id)} className="text-red-500 hover:underline">حذف</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
