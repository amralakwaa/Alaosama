"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Stats {
  users: { total: number; newThisWeek: number };
  books: { total: number; approved: number; pending: number; rejected: number };
  engagement: { totalDownloads: number; totalReads: number };
  publishingRequests?: { sent: number; reviewing: number; approved: number };
}

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Assistant State
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [customQuery, setCustomQuery] = useState("");
  const [aiQueryLoading, setAiQueryLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchAllData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch(`${API}/admin/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!statsRes.ok) {
          throw new Error("فشل جلب الإحصائيات (قد لا تملك صلاحية مدير)");
        }
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch initial AI insight
        const aiRes = await fetch(`${API}/ai/admin/insights`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ query: "لخص لي أداء المنصة بناءً على الإحصائيات الحالية." }),
        });
        const aiData = await aiRes.json();
        setAiInsight(aiData.text || "تعذر جلب الملخص.");
      } catch (err: any) {
        console.error("Failed to load dashboard data", err);
        setAiInsight(err.message || "حدث خطأ أثناء الاتصال بالخادم.");
        setStats(null); // Ensure stats remains null on error so it doesn't crash JSX
      } finally {
        setLoading(false);
        setAiLoading(false);
      }
    };

    fetchAllData();
  }, [accessToken]);

  const handleCustomQuery = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!customQuery.trim() || aiQueryLoading) return;

    setAiQueryLoading(true);
    const userQuery = customQuery;
    setAiInsight((prev) => prev + `\n\n--- \n\n**سؤالك:** ${userQuery}\n\n*جاري التفكير...*`);
    setCustomQuery("");
    
    // scroll down
    setTimeout(() => {
      aiEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);

    try {
      const aiRes = await fetch(`${API}/ai/admin/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query: userQuery }),
      });
      const aiData = await aiRes.json();
      setAiInsight((prev) => prev.replace('*جاري التفكير...*', aiData.text));
    } catch (err) {
      setAiInsight((prev) => prev.replace('*جاري التفكير...*', 'تعذر جلب الإجابة.'));
    } finally {
      setAiQueryLoading(false);
      setTimeout(() => {
        aiEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {/* ── Header ── */}
      <div>
        <h1 className="text-[28px] font-black font-display text-[#0A0806] dark:text-[#F5F0E8]">
          نظرة عامة
        </h1>
        <p className="text-[#A08B6B] dark:text-[#7A6548] text-[14px] mt-1">
          إحصائيات وأداء منصة مكتبة أسامة
        </p>
      </div>

      {loading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#FAF8F5] dark:bg-[#1E1812] border border-[#E2EFE7] dark:border-[#152B20] rounded-[20px] p-6 animate-pulse">
              <div className="h-10 bg-[#E2EFE7] dark:bg-[#2A241A] rounded-[10px] w-10 mb-4" />
              <div className="h-8 bg-[#E2EFE7] dark:bg-[#2A241A] rounded-[8px] w-1/3 mb-2" />
              <div className="h-4 bg-[#E2EFE7] dark:bg-[#2A241A] rounded-[6px] w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          
          {/* ── AI Admin Assistant ── */}
          <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] rounded-[24px] overflow-hidden shadow-lg border border-[#2D6A4F]/20 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                ✨
              </div>
              <div className="flex-1 w-full min-w-0">
                <h3 className="text-white font-display font-bold text-[18px] mb-2 flex items-center gap-2">
                  مساعد الإدارة الذكي
                  {aiLoading && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span></span>}
                </h3>
                
                <div className="bg-black/20 rounded-[16px] p-5 mb-5 border border-white/10 backdrop-blur-sm max-h-[300px] overflow-y-auto custom-scrollbar">
                  {aiLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="text-white/90 text-[14px] leading-relaxed font-medium whitespace-pre-line">
                      {aiInsight}
                      <div ref={aiEndRef} />
                    </div>
                  )}
                </div>

                <form onSubmit={handleCustomQuery} className="relative">
                  <input 
                    type="text" 
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder="اسأل الذكاء الاصطناعي عن الإحصائيات، الكتب، أو المستخدمين..."
                    className="w-full bg-white/10 border border-white/20 rounded-[14px] py-3.5 pr-4 pl-12 text-white placeholder-white/50 text-[14px] outline-none focus:bg-white/15 focus:border-white/40 transition-all font-display"
                    disabled={aiLoading || aiQueryLoading}
                  />
                  <button 
                    type="submit"
                    disabled={!customQuery.trim() || aiQueryLoading}
                    className="absolute left-2.5 top-2.5 bottom-2.5 w-10 bg-white hover:bg-[#E2EFE7] text-[#2D6A4F] rounded-[10px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── Books & Engagement Stats ── */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#E2EFE7] dark:bg-[#152B20] text-[#2D6A4F] flex items-center justify-center text-sm">📚</div>
              <h3 className="font-bold text-[16px] text-[#0A0806] dark:text-[#F5F0E8] font-display">الكتب والتفاعل</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <StatCard 
                label="إجمالي الكتب" 
                value={stats.books.total} 
                icon="📖" 
                sub={`${stats.books.approved} كتاب متاح`} 
              />
              <StatCard 
                label="طلبات النشر (قيد المراجعة)" 
                value={stats.books.pending} 
                icon="⏳" 
                sub="تحتاج موافقة" 
                highlight
              />
              <StatCard 
                label="عمليات التحميل" 
                value={stats.engagement.totalDownloads} 
                icon="⬇️" 
                sub="ملفات PDF" 
              />
              <StatCard 
                label="مرات القراءة" 
                value={stats.engagement.totalReads} 
                icon="👁️" 
                sub="أونلاين" 
              />
            </div>
          </div>

          {/* ── Users Stats ── */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-[#1E1812] text-[#B8800A] flex items-center justify-center text-sm">👥</div>
              <h3 className="font-bold text-[16px] text-[#0A0806] dark:text-[#F5F0E8] font-display">المستخدمون</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <StatCard 
                label="إجمالي الأعضاء" 
                value={stats.users.total} 
                icon="👤" 
                sub={`+${stats.users.newThisWeek} هذا الأسبوع`} 
                subColor="text-[#2D6A4F] dark:text-[#E2EFE7] bg-[#E2EFE7] dark:bg-[#152B20]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card Component ──
function StatCard({ label, value, icon, sub, highlight = false, subColor = "text-[#A08B6B] dark:text-[#7A6548] bg-[#FAF8F5] dark:bg-[#1E1812]" }: any) {
  return (
    <div className={`bg-white dark:bg-[#14120E] border rounded-[20px] p-5 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md ${
      highlight 
        ? "border-[#B8800A] shadow-[0_0_15px_rgba(184,128,10,0.1)]" 
        : "border-[#E2EFE7] dark:border-[#152B20] hover:border-[#2D6A4F]/30"
    }`}>
      {highlight && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#B8800A]/10 to-transparent rounded-bl-full" />
      )}
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-2xl bg-[#FAF8F5] dark:bg-[#1E1812] w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
          {icon}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
          highlight ? "bg-[#B8800A] text-white" : subColor
        }`}>
          {sub}
        </span>
      </div>
      
      <div className="relative z-10 mt-auto">
        <span className="text-[32px] font-black text-[#0A0806] dark:text-[#F5F0E8] leading-none block mb-1">
          {value.toLocaleString('ar-EG')}
        </span>
        <span className="text-[#7A6548] dark:text-[#A08B6B] text-[13px] font-bold">
          {label}
        </span>
      </div>
    </div>
  );
}
