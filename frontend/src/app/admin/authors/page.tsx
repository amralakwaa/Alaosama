"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AdminAuthorsPage() {
  const { accessToken } = useAuth();
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuthors = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      // For now, we'll just filter users by role 'author' (client-side for simplicity, in a real app this should be an API endpoint)
      const res = await fetch(`${API}/admin/users?limit=100`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      const onlyAuthors = (data.data || []).filter((u: any) => u.role === 'author' || u.role === 'admin');
      setAuthors(onlyAuthors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, [accessToken]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">إدارة المؤلفين</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">عرض المؤلفين المسجلين في المنصة</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--background)] border-b border-[var(--border-color)]">
            <tr>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">البريد الإلكتروني</th>
              <th className="px-4 py-3">الصلاحية</th>
              <th className="px-4 py-3">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10">جاري التحميل...</td></tr>
            ) : authors.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-[var(--text-muted)]">لا يوجد مؤلفين.</td></tr>
            ) : (
              authors.map((author) => (
                <tr key={author.id} className="border-b border-[var(--border-color)] hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-3 font-bold">{author.name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{author.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs font-bold">
                      {author.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{new Date(author.createdAt).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
