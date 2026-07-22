"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AdminAddNewBookPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
    // Load authors from admin endpoint
    fetch(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => {
        const authorList = (data.data || []).filter((u: any) => u.role === 'author' || u.role === 'admin');
        setAuthors(authorList);
      })
      .catch(console.error);
  }, [accessToken]);

  const handleUploadFile = async (file: File, type: 'pdf' | 'image') => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API}/upload/${type}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || `Failed to upload ${type}`);
    }
    const data = await res.json();
    return data.url; // /public/uploads/books/...
  };

  const handleGenerateAI = async () => {
    if (!title) {
      setError("الرجاء كتابة فكرة أو موضوع الكتاب في حقل العنوان أولاً");
      return;
    }
    setError("");
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/ai/author/assist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          bookTitle: title,
          action: "generate_meta"
        }),
      });

      if (!res.ok) throw new Error("فشل توليد البيانات بالذكاء الاصطناعي");
      
      const data = await res.json();
      const text = data.text;
      
      // Parse output: "العنوان: ... \nالوصف: ..."
      const titleMatch = text.match(/العنوان:\s*(.*)/);
      const descMatch = text.match(/الوصف:\s*([\s\S]*)/);
      
      if (titleMatch?.[1]) setTitle(titleMatch[1].trim());
      if (descMatch?.[1]) setDescription(descMatch[1].trim());
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !coverFile || !categoryId) {
      setError("الرجاء إرفاق الغلاف، المخطوطة واختيار التصنيف");
      return;
    }
    
    setError("");
    setLoading(true);
    setProgress(10);

    try {
      // 1. Upload Cover
      const coverUrl = await handleUploadFile(coverFile, 'image');
      setProgress(40);

      // 2. Upload PDF
      const pdfUrl = await handleUploadFile(pdfFile, 'pdf');
      setProgress(80);

      // 3. Create Book entry
      const res = await fetch(`${API}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          categoryId: Number(categoryId),
          authorId: authorId ? Number(authorId) : undefined,
          isPremium,
          pageCount: Number(pageCount),
          coverImageUrl: coverUrl,
          pdfKey: pdfUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "فشل في حفظ بيانات الكتاب");
      }

      setProgress(100);
      // Wait a moment then redirect
      setTimeout(() => {
        router.push("/admin/books");
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء الرفع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/books" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
          &rarr; عودة
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">إضافة كتاب جديد (كإدارة)</h1>
          <p className="text-[var(--text-muted)]">
            رفع كتاب مباشرة إلى قاعدة بيانات المنصة. سيتم إضافته بحالة المراجعة مبدئياً لتقوم بنشره من قائمة الكتب.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius-xl)] p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        
        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold">عنوان أو فكرة الكتاب</label>
            <button 
              type="button" 
              onClick={handleGenerateAI}
              disabled={aiLoading || !title}
              className="text-[12px] bg-gradient-to-r from-[#B8800A] to-[#7A5200] text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {aiLoading ? (
                <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              ) : "✨"}
              توليد العنوان والوصف بالذكاء الاصطناعي
            </button>
          </div>
          <Input 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="مثال: تاريخ اليمن الحديث (أو اكتب فكرة بسيطة وسيقوم الذكاء بتوليد الباقي)"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold mb-2">وصف الكتاب (نبذة)</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب نبذة عن محتوى الكتاب..."
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
          />
        </div>

        {/* Author + Category + Pages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">المؤلف (اختياري)</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">نفس الإدارة (افتراضي)</option>
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
            <label className="block text-sm font-bold mb-2">عدد الصفحات التقديري</label>
            <Input 
              type="number" 
              required 
              min={1} 
              value={pageCount} 
              onChange={(e) => setPageCount(Number(e.target.value))} 
            />
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-bold mb-2">نوع الكتاب</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!isPremium} onChange={() => setIsPremium(false)} name="isPremium" />
              <span>مجاني (متاح للجميع)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={isPremium} onChange={() => setIsPremium(true)} name="isPremium" />
              <span>مدفوع (يخضع لرسوم/اشتراك PLUS)</span>
            </label>
          </div>
        </div>

        {/* Files */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]">
          {/* Cover */}
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--color-accent)] transition-colors">
            <div className="text-3xl mb-2">🖼️</div>
            <p className="font-bold mb-1">صورة الغلاف</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">JPG، PNG، WebP (بحد أقصى 5MB)</p>
            {coverPreview && (
              <img src={coverPreview} alt="معاينة الغلاف" className="w-24 h-36 object-cover rounded-md mx-auto mb-3 shadow border border-[var(--border-color)]" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              required
              onChange={e => {
                const f = e.target.files?.[0] || null;
                setCoverFile(f);
                if (f) setCoverPreview(URL.createObjectURL(f));
                else setCoverPreview(null);
              }}
              className="text-xs w-full"
            />
          </div>

          {/* PDF */}
          <div className="border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--color-accent)] transition-colors">
            <div className="text-3xl mb-2">📄</div>
            <p className="font-bold mb-1">المخطوطة (PDF)</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">ملف PDF واحد (بحد أقصى 100MB)</p>
            <input 
              type="file" 
              accept="application/pdf" 
              required
              onChange={e => setPdfFile(e.target.files?.[0] || null)}
              className="text-xs w-full"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-[var(--radius-md)] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div className="w-full bg-[var(--border-color)] rounded-full h-2.5 overflow-hidden">
            <div className="bg-[var(--color-accent)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <Button type="submit" disabled={loading} variant="accent" className="w-full py-3 mt-2 text-lg">
          {loading ? (progress === 100 ? "تم الرفع بنجاح!" : "جاري الرفع...") : "رفع الكتاب الآن"}
        </Button>
      </form>
    </div>
  );
}
