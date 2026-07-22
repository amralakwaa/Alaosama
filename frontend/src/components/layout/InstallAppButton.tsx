"use client";

import { useState, useEffect } from "react";

interface InstallAppButtonProps {
  className?: string;
  variant?: "solid" | "outline";
}

export default function InstallAppButton({ className = "", variant = "solid" }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("لتثبيت التطبيق على جهازك:\n\n- في الايفون (Safari): اضغط على زر المشاركة (Share) ثم اختر 'إضافة للشاشة الرئيسية' (Add to Home Screen).\n- في الاندرويد والكمبيوتر: التطبيق مثبت بالفعل أو يمكنك التثبيت من القائمة العلوية للمتصفح.");
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const baseClass = variant === "outline" ? "btn btn-ghost" : "btn btn-gold";

  return (
    <button 
      onClick={handleInstallClick}
      className={`${baseClass} btn-sm flex items-center justify-center gap-2 ${className}`}
      style={{ paddingInline: '0.75rem' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>تحميل التطبيق</span>
    </button>
  );
}
