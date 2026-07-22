"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AuthorPublishRequestPage() {
  const { accessToken } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    manuscriptTitle: "",
    authorName: "",
    phone: "",
    genre: "",
    description: "",
  });

  const loadRequests = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API}/publish-requests/my`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/publish-requests`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("تم تقديم الطلب بنجاح!");
        setFormData({ manuscriptTitle: "", authorName: "", phone: "", genre: "", description: "" });
        loadRequests();
      } else {
        alert("حدث خطأ أثناء تقديم الطلب.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">طلبات النشر</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">قدّم مخطوطتك لدار أسامة وتابع حالة طلباتك</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-lg)] p-6">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>📝</span> نموذج طلب نشر جديد
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">عنوان المخطوطة / الكتاب</label>
              <Input required value={formData.manuscriptTitle} onChange={e => setFormData({...formData, manuscriptTitle: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">اسم المؤلف الكامل</label>
                <Input required value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">رقم الهاتف (للتواصل)</label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">نوع الكتاب / التصنيف</label>
              <Input required value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} placeholder="رواية، شعر، دراسة أكاديمية..." />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">نبذة عن الكتاب</label>
              <textarea
                required
                className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-3 h-32 focus:outline-none focus:border-[var(--color-accent)]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? 'جاري الإرسال...' : 'إرسال طلب النشر'}
            </Button>
          </form>
        </div>

        {/* Previous Requests */}
        <div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span>📋</span> طلباتك السابقة
          </h2>
          {loading ? (
            <div>جاري التحميل...</div>
          ) : requests.length === 0 ? (
            <div className="text-[var(--text-muted)] text-sm bg-[var(--background)] p-4 rounded-[var(--radius-md)] border border-[var(--border-color)] border-dashed text-center">
              لم تقم بتقديم أي طلب نشر بعد.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map(req => (
                <div key={req.id} className="bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">{req.manuscriptTitle}</h3>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded text-xs font-bold">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">تم التقديم: {new Date(req.createdAt).toLocaleDateString('ar-EG')}</p>
                  {req.adminNotes && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded text-sm text-blue-800 dark:text-blue-300">
                      <strong>ملاحظة الإدارة:</strong> {req.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
