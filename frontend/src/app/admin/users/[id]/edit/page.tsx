"use client";

import { useState, FormEvent, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { accessToken } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    bio: "",
    location: "",
    password: ""
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!accessToken || !id) return;
    
    // Fetch users list and find
    fetch(`${API}/admin/users?limit=500`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(data => {
        const user = data.data.find((u: any) => u.id.toString() === id);
        if (user) {
          // Fetch full user details if there's an endpoint, or use the summary
          // Wait, admin users endpoint returns basic details. Let's populate what we have
          // Since bio and avatar are now there, we need them returned.
          setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            bio: user.bio || "",
            location: user.location || "",
            password: ""
          });
          setAvatarPreview(user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API.replace('/api','')}${user.avatar}`) : null);
        } else {
          setError("المستخدم غير موجود");
        }
      })
      .catch(() => setError("فشل في جلب البيانات"))
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      let avatarUrl = undefined;
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", avatarFile);
        const res = await fetch(`${API}/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formDataUpload,
        });
        if (!res.ok) throw new Error("فشل رفع الصورة الشخصية");
        const data = await res.json();
        avatarUrl = data.url;
      }

      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        bio: formData.bio,
        location: formData.location,
      };

      if (avatarUrl) payload.avatar = avatarUrl;
      if (formData.password) payload.password = formData.password;

      const res = await fetch(`${API}/admin/users/admin/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل تحديث البيانات");
      }

      setSuccess("تم تحديث بيانات المستخدم بنجاح");
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">تعديل ملف المستخدم</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">تعديل صلاحيات وصور وسير المؤلفين والمستخدمين</p>
        </div>
        <Link href="/admin/users">
          <Button variant="ghost">عودة للكل</Button>
        </Link>
      </div>

      {error && <div className="p-4 mb-6 bg-red-500/10 text-red-500 rounded text-sm">{error}</div>}
      {success && <div className="p-4 mb-6 bg-green-500/10 text-green-500 rounded text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[var(--card-bg)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Avatar Section */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-[var(--background)] border-2 border-dashed border-[var(--border-color)] mb-4 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setAvatarFile(f);
                  if (f) setAvatarPreview(URL.createObjectURL(f));
                }}
                className="text-xs w-full max-w-[200px]"
              />
              <p className="text-xs text-[var(--text-muted)] text-center mt-2">اختر صورة للمؤلف/المستخدم لتغيير الحالية</p>
            </div>

            {/* Form Fields */}
            <div className="w-full md:w-2/3 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">الاسم الكامل</label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">السيرة الذاتية (للمؤلفين خاصة)</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  placeholder="اكتب نبذة عن المؤلف لتظهر في صفحته العامة..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">الصلاحية</label>
                  <select 
                    className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded p-2.5 text-sm"
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">مستخدم عادي</option>
                    <option value="author">مؤلف</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الحالة</label>
                  <select 
                    className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded p-2.5 text-sm"
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">نشط</option>
                    <option value="banned">محظور</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">تعيين كلمة مرور جديدة (اختياري)</label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="اتركه فارغاً للاحتفاظ بالحالية" />
              </div>
            </div>

          </div>
        </div>

        <Button type="submit" variant="accent" className="w-full py-3" disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ بيانات المستخدم"}
        </Button>
      </form>
    </div>
  );
}