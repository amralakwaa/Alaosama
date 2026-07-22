"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AdminCategoriesPage() {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", icon: "", description: "" });

  const loadCategories = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/categories/with-counts`);
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`${API}/categories/${editingId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`${API}/categories`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setEditingId(null);
      setFormData({ name: "", slug: "", icon: "", description: "" });
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description || "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟ سيؤدي ذلك لترك الكتب بدون تصنيف مؤقتاً.')) return;
    await fetch(`${API}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    loadCategories();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">إدارة الأقسام والتصنيفات</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">إضافة، تعديل، وحذف تصنيفات الكتب</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--background)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-color)] mb-8 flex flex-col gap-4 max-w-2xl">
        <h3 className="font-bold">{editingId ? "تعديل القسم" : "إضافة قسم جديد"}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1">الاسم</label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs mb-1">الرابط (Slug - بالإنجليزية)</label>
            <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} required />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block text-xs mb-1">أيقونة (Emoji)</label>
            <Input value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} />
          </div>
          <div className="col-span-3">
            <label className="block text-xs mb-1">الوصف</label>
            <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button type="submit" variant="accent">{editingId ? "حفظ التعديلات" : "إضافة القسم"}</Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setFormData({ name: "", slug: "", icon: "", description: "" }); }}>إلغاء</Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>جاري التحميل...</div>
        ) : categories.map((cat) => (
          <div key={cat.id} className="bg-[var(--background)] border border-[var(--border-color)] p-5 rounded-[var(--radius-lg)] flex flex-col hover:border-[var(--color-accent)] transition-colors group">
            <div className="flex justify-between items-start mb-3">
              <div className="w-12 h-12 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded flex items-center justify-center text-2xl">
                {cat.icon || '📚'}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(cat)} className="text-blue-500 text-xs hover:underline">تعديل</button>
                <button onClick={() => handleDelete(cat.id)} className="text-red-500 text-xs hover:underline">حذف</button>
              </div>
            </div>
            <h3 className="font-bold mb-1">{cat.name}</h3>
            <p className="text-xs text-[var(--text-muted)] mb-2 font-mono">{cat.slug}</p>
            <p className="text-xs text-[var(--text-muted)] mt-auto pt-2 border-t border-[var(--border-color)]">
              {cat.booksCount} كتاب مرتبط
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
