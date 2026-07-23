"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button, Input } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AdminServicesPage() {
  const { accessToken } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const loadServices = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/services/admin/all`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      setServices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [accessToken]);

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API}/services`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, icon }),
    });
    setName("");
    setDescription("");
    setIcon("");
    loadServices();
  };

  const deleteService = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await fetch(`${API}/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    loadServices();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">إدارة الخدمات</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">الخدمات المعروضة في الصفحة الرئيسية (أمانات، مستلزمات...)</p>
      </div>

      <form onSubmit={addService} className="bg-[var(--background)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-color)] mb-8 flex flex-col gap-4 max-w-2xl">
        <h3 className="font-bold">إضافة خدمة جديدة</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="اسم الخدمة" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="أيقونة (مثال: 📦)" value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>
        <Input placeholder="وصف الخدمة" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <Button type="submit" variant="accent" className="w-fit">إضافة الخدمة</Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>جاري التحميل...</div>
        ) : services.length === 0 ? (
          <div className="text-[var(--text-muted)]">لا توجد خدمات. قم بإضافة واحدة!</div>
        ) : (
          services.map((svc) => (
            <div key={svc.id} className="bg-[var(--background)] border border-[var(--border-color)] p-5 rounded-[var(--radius-lg)] flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded flex items-center justify-center text-2xl">
                  {svc.icon || '✨'}
                </div>
                <button onClick={() => deleteService(svc.id)} className="text-red-500 text-xs hover:underline">حذف</button>
              </div>
              <h3 className="font-bold mb-1">{svc.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{svc.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
