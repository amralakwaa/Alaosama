"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function AdminLogsPage() {
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    
    fetch(`${API}/admin/logs?limit=100`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(data => setLogs(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">سجل الأمان والنشاطات</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">تتبع نشاطات الإدارة (Activity Log)</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-[var(--background)] rounded-[var(--radius-lg)] border border-[var(--border-color)]">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-[var(--text-muted)] uppercase border-b border-[var(--border-color)]">
            <tr>
              <th className="px-4 py-3">الوقت</th>
              <th className="px-4 py-3">المسؤول (المدير)</th>
              <th className="px-4 py-3">نوع الإجراء</th>
              <th className="px-4 py-3">الكيان المستهدف</th>
              <th className="px-4 py-3">التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">جاري التحميل...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-[var(--text-muted)]">لا توجد سجلات بعد.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-bg-hover)] transition-colors">
                  <td className="px-4 py-3 text-[var(--text-muted)]" dir="ltr">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="px-4 py-3 font-bold text-blue-400">{log.admin?.name || 'مجهول'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.actionType === 'UPDATE' ? 'bg-yellow-500/20 text-yellow-500' :
                      log.actionType === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.targetEntity} #{log.targetId}</td>
                  <td className="px-4 py-3">
                    <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap font-[family-name:monospace]">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
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