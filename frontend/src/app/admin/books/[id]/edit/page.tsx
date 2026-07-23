"use client";

import { useState, FormEvent, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AdminEditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { accessToken } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [pageCount, setPageCount] = useState(100);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [authors, setAuthors] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load categories
    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);

    // Load authors
    if (accessToken) {
      fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(r => r.ok ? r.json() : { data: [] })
        .then(data => {
          const authorList = (data.data || []).filter((u: any) => u.role === 'author' || u.role === 'admin');
          setAuthors(authorList);
        })
        .catch(console.error);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !id) return;
    
    // Admin needs a way to fetch a book by ID. Since public search might use slug, 
    // let's fetch from admin endpoint or search endpoint.
    fetch(`${API}/books/admin/all?limit=500`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(data => {
        const book = data.data.find((b: any) => b.id.toString() === id);
        if (book) {
          setTitle(book.title);
          setDescription(book.description || "");
          setCategoryId(book.category?.id?.toString() || "");
          setAuthorId(book.author?.id?.toString() || "");
          setIsPremium(book.isPremium || false);
          setPageCount(book.pageCount || 100);
          setCoverPreview(book.coverImageUrl ? (book.coverImageUrl.startsWith('http') ? book.coverImageUrl : `${API.replace('/api','')}${book.coverImageUrl}`) : null);
        } else {
          setError("لم يتم العثور على الكتاب");
        }
      })
      .catch(() => setError("فشل في جلب بيانات الكتاب"))
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  const handleUploadFile = async (file: File, type: 'pdf' | 'image') => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/upload/${type}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `فشل رفع ${type}`);
    }
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setProgress(10);

    try {
      let coverUrl = undefined;
      let pdfUrl = undefined;

      if (coverFile) {
        setProgress(30);
        coverUrl = await handleUploadFile(coverFile, 'image');
      }

      if (pdfFile) {
        setProgress(60);
        pdfUrl = await handleUploadFile(pdfFile, 'pdf');
      }

      setProgress(80);

      const res = await fetch(`${API}/books/admin/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          categoryId: categoryId ? Number(categoryId) : undefined,
          authorId: authorId ? Number(authorId) : undefined,
          isPremium,
          pageCount: Number(pageCount),
          coverImageUrl: coverUrl,
          pdfKey: pdfUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل تحديث الكتاب");
      }

      setProgress(100);
      router.push("/admin/books");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">تعديل كتاب</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">تعديل محتوى وملفات الكتاب</p>
        </div>
        <Link href="/admin/books">
          <Button variant="ghost">عودة للكتب</Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[var(--radius-md)] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[var(--card-bg)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-color)] space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">عنوان الكتاب</label>
            <Input 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="مثال: مقدمة في علم البيانات" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">الوصف المكتوب</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              placeholder="اكتب نبذة عن الكتاب..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">المؤلف</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">بدون مؤلف محدد</option>
              {authors.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">التصنيف</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="" disabled>اختر التصنيف...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">عدد الصفحات</label>
            <Input 
              type="number" 
              required 
              min={1} 
              value={pageCount} 
              onChange={(e) => setPageCount(Number(e.target.value))} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--color-accent)] transition-colors">
            <div className="text-3xl mb-2">🖼️</div>
            <p className="font-bold mb-1">صورة الغلاف (تغيير)</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">اتركه فارغاً للاحتفاظ بالغلاف الحالي</p>
            {coverPreview && (
              <img src={coverPreview} alt="معاينة الغلاف" className="w-24 h-36 object-cover rounded-md mx-auto mb-3 shadow border border-[var(--border-color)]" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const f = e.target.files?.[0] || null;
                setCoverFile(f);
                if (f) setCoverPreview(URL.createObjectURL(f));
              }}
              className="text-xs w-full"
            />
          </div>

          <div className="border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--color-accent)] transition-colors">
            <div className="text-3xl mb-2">📄</div>
            <p className="font-bold mb-1">ملف الكتاب PDF (استبدال)</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">اتركه فارغاً للاحتفاظ بالملف الحالي</p>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={e => setPdfFile(e.target.files?.[0] || null)}
              className="text-xs w-full"
            />
            {pdfFile && <p className="text-green-500 text-xs mt-2 font-bold">تم اختيار ملف جديد: {pdfFile.name}</p>}
          </div>
        </div>

        {saving && (
          <div className="w-full bg-[var(--border-color)] rounded-full h-2 mb-4 overflow-hidden">
            <div className="bg-[var(--color-accent)] h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <Button 
          type="submit" 
          variant="accent" 
          className="w-full py-3"
          disabled={saving}
        >
          {saving ? `جاري حفظ التعديلات... ${progress}%` : "حفظ التعديلات الان"}
        </Button>
      </form>
    </div>
  );
}