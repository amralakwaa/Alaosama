"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user", status: "active" });

  const loadUsers = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/users?limit=50`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [accessToken]);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    await fetch(`${API}/admin/users/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    loadUsers();
  };

  const handleToggleFeature = async (id: number, currentFeatured: boolean) => {
    try {
      await fetch(`${API}/admin/users/${id}/feature`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password

      if (isAdding) {
        // Create user (we can use the auth register endpoint, or a dedicated admin endpoint)
        // Since we don't have a dedicated admin POST user, we'll use auth register then update role
        const regRes = await fetch(`${API}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
        });
        const regData = await regRes.json();
        
        if (regData.user?.id) {
          await fetch(`${API}/admin/users/admin`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }
      setIsAdding(false);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };


  const openAdd = () => {
    setIsAdding(true);
    setFormData({ name: "", email: "", password: "", role: "user", status: "active" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">إدارة المستخدمين</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">إضافة وحذف وتعديل صلاحيات الحسابات</p>
        </div>
        <Button variant="accent" onClick={openAdd}>إضافة مستخدم جديد</Button>
      </div>

      <div className="overflow-x-auto bg-[var(--background)] rounded-[var(--radius-lg)] border border-[var(--border-color)]">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-[var(--text-muted)] uppercase border-b border-[var(--border-color)]">
            <tr>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">البريد الإلكتروني</th>
              <th className="px-4 py-3">الصلاحية</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3 text-center">مميز</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">جاري التحميل...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-bg-hover)] transition-colors">
                  <td className="px-4 py-3 font-bold">{user.name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' : 
                      user.role === 'author' ? 'bg-purple-100 text-purple-700' : 
                      'bg-[var(--card-bg)] text-[var(--foreground)] border'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      user.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleFeature(user.id, user.isFeatured)}
                      className={`text-xl transition-transform hover:scale-110 ${user.isFeatured ? 'text-yellow-500' : 'text-[var(--border-color)] hover:text-yellow-500/50'}`}
                      title={user.isFeatured ? "إلغاء التمييز" : "تمييز المستخدم"}
                    >
                      ★
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/admin/users/${user.id}/edit`} className="text-blue-500 hover:underline">تعديل</Link>
                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline">حذف</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--background)] p-6 rounded-[var(--radius-lg)] w-full max-w-lg border border-[var(--border-color)]">
            <h2 className="text-xl font-bold mb-4">إضافة مستخدم جديد</h2>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs mb-1">الاسم الكامل</label>
                <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs mb-1">البريد الإلكتروني</label>
                <Input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs mb-1">كلمة المرور</label>
                <Input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1">الصلاحية</label>
                  <select className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded p-2 text-sm" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="user">مستخدم عادي</option>
                    <option value="author">مؤلف</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1">الحالة</label>
                  <select className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded p-2 text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="banned">محظور</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" variant="accent">إضافة المستخدم</Button>
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
