"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AdminPublishingRequestsPage() {
  const { accessToken } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/publish-requests`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      setRequests(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [accessToken]);

  const updateStatus = async (id: number, newStatus: string) => {
    await fetch(`${API}/publish-requests/${id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadRequests();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">طلبات النشر</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">مراجعة طلبات النشر المقدمة من المؤلفين</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-[var(--text-muted)] uppercase bg-[var(--background)] border-b border-[var(--border-color)]">
            <tr>
              <th className="px-4 py-3">المخطوطة</th>
              <th className="px-4 py-3">المؤلف</th>
              <th className="px-4 py-3">رقم التواصل</th>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">تحديث</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">جاري التحميل...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-[var(--text-muted)]">لا توجد طلبات.</td></tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="border-b border-[var(--border-color)] hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-3 font-bold">{req.manuscriptTitle}</td>
                  <td className="px-4 py-3">{req.authorName || req.user?.name}</td>
                  <td className="px-4 py-3 text-[var(--color-accent)]">{req.phone}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{new Date(req.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded text-xs font-bold">
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] text-xs rounded p-1"
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                    >
                      <option value="sent">جديد</option>
                      <option value="reviewing">قيد المراجعة</option>
                      <option value="approved">مقبول</option>
                      <option value="needs_revision">يحتاج تعديل</option>
                      <option value="rejected">مرفوض</option>
                    </select>
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
