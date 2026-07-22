"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface BookResult {
  id: number;
  title: string;
  slug: string;
  coverImageUrl?: string;
  authorName: string;
  categoryName: string;
  isPremium: boolean;
  averageRating: number;
  description?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  books?: BookResult[];
  timestamp: Date;
  isLoading?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "اقترح لي كتاباً عن التنمية البشرية",
  "ما هي أفضل الكتب المجانية؟",
  "ابحث لي عن كتب الأطفال",
  "أريد كتاباً عن التاريخ الإسلامي",
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "مرحباً! 👋 أنا مساعدك الذكي في مكتبة أسامة.\n\nيمكنني مساعدتك في البحث عن الكتب، واقتراح ما يناسب اهتماماتك، والإجابة عن أسئلتك.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeMsg, setShowWelcomeMsg] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowWelcomeMsg(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: messageText,
      timestamp: new Date(),
    };

    const loadingMsg: Message = {
      id: "loading",
      role: "assistant",
      text: "",
      isLoading: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: Date.now().toString() + "_ai",
        role: "assistant",
        text: data.text || "عذراً، لم أتمكن من معالجة طلبك.",
        books: data.books || [],
        timestamp: new Date(),
      };

      setMessages((prev) => prev.filter((m) => m.id !== "loading").concat(assistantMsg));
    } catch (err) {
      setMessages((prev) =>
        prev.filter((m) => m.id !== "loading").concat({
          id: "err_" + Date.now(),
          role: "assistant",
          text: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.",
          timestamp: new Date(),
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Chat Panel ───────────────────────────────── */}
      <div
        className={`fixed bottom-48 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-50 transition-all duration-500 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        dir="rtl"
      >
        <div className="bg-white dark:bg-[#14120E] rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-[#F0EBE1] dark:border-[#2A241A] overflow-hidden flex flex-col max-h-[80vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-[#B8800A] to-[#7A5200] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
                ✨
              </div>
              <div>
                <h3 className="text-white font-display font-bold text-[15px] leading-none">المساعد الذكي</h3>
                <p className="text-white/70 text-[11px] mt-0.5">مكتبة أسامة الرقمية</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="إغلاق"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Suggested questions (only show if just 1 message) */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-[11px] text-[#A08B6B] dark:text-[#7A6548] font-display tracking-wider uppercase">جرّب أن تسأل:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-right text-[13px] text-[#7A6548] dark:text-[#C4AF92] bg-[#FAF7F2] dark:bg-[#1E1812] hover:bg-[#F0E8DA] dark:hover:bg-[#2A241A] border border-[#E3D8C8] dark:border-[#3D3323] rounded-[14px] px-4 py-2.5 transition-all duration-200 hover:text-[#B8800A]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-[#F0EBE1] dark:border-[#2A241A] flex-shrink-0">
            <div className="flex items-end gap-2 bg-[#FAF7F2] dark:bg-[#1E1812] rounded-[18px] px-4 py-2 border border-[#E3D8C8] dark:border-[#3D3323] focus-within:border-[#B8800A]/50 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك هنا..."
                rows={1}
                style={{ resize: "none" }}
                className="flex-1 bg-transparent text-[14px] text-[#0A0806] dark:text-[#F5F0E8] placeholder-[#A08B6B] dark:placeholder-[#7A6548] outline-none py-1 font-display leading-relaxed"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-[#B8800A] hover:bg-[#D4A030] text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
                aria-label="إرسال"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-[#C4AF92] dark:text-[#7A6548] mt-2">
              مدعوم بالذكاء الاصطناعي • المعلومات من قاعدة بيانات المكتبة
            </p>
          </div>
        </div>
      </div>

      {/* ── Floating Button & Welcome Message ───────────────────────────── */}
      <div className="fixed bottom-32 right-6 z-50 flex items-center justify-end">
        {/* Welcome Message Bubble */}
        {!isOpen && showWelcomeMsg && (
          <div className="absolute right-[70px] bg-white dark:bg-[#14120E] border border-[#F0EBE1] dark:border-[#2A241A] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] py-2.5 px-4 flex items-center gap-3 animate-fade-in-up origin-right">
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white dark:bg-[#14120E] border-t border-r border-[#F0EBE1] dark:border-[#2A241A] rotate-45" />
            <p className="text-[13px] font-bold font-display text-[#0A0806] dark:text-[#F5F0E8] whitespace-nowrap">
              تحدث مع المساعد الذكي ✨
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeMsg(false);
              }}
              className="text-[#A08B6B] hover:text-[#B8800A] transition-colors"
              aria-label="إغلاق الرسالة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-[0_8px_32px_rgba(184,128,10,0.35)] transition-all duration-300 flex items-center justify-center group ${
            isOpen
              ? "bg-[#7A5200] rotate-0 scale-95"
              : "bg-gradient-to-br from-[#B8800A] to-[#7A5200] hover:scale-110 hover:shadow-[0_12px_40px_rgba(184,128,10,0.5)]"
          }`}
          aria-label="فتح المساعد الذكي"
        >
          <span className={`transition-all duration-300 text-2xl ${isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"} absolute`}>✨</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-all duration-300 absolute ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
          >
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>

          {/* Pulse ring when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-[#B8800A]/30 animate-ping" />
          )}
        </button>
      </div>
    </>
  );
}

// ── Chat Bubble Component ─────────────────────────────────
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (message.isLoading) {
    return (
      <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B8800A] to-[#7A5200] flex-shrink-0 flex items-center justify-center text-white text-xs">✨</div>
        <div className="bg-[#FAF7F2] dark:bg-[#1E1812] border border-[#E3D8C8] dark:border-[#3D3323] rounded-[18px] rounded-br-[6px] px-4 py-3">
          <div className="flex gap-1.5 items-center h-4">
            <span className="w-1.5 h-1.5 bg-[#B8800A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-[#B8800A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-[#B8800A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B8800A] to-[#7A5200] flex-shrink-0 flex items-center justify-center text-white text-xs">✨</div>
      )}

      <div className={`max-w-[80%] flex flex-col gap-3 ${isUser ? "items-end" : "items-start"}`}>
        {/* Text bubble */}
        <div
          className={`px-4 py-3 rounded-[18px] text-[13px] leading-relaxed whitespace-pre-line ${
            isUser
              ? "bg-[#B8800A] text-white rounded-bl-[6px]"
              : "bg-[#FAF7F2] dark:bg-[#1E1812] text-[#0A0806] dark:text-[#F5F0E8] border border-[#E3D8C8] dark:border-[#3D3323] rounded-br-[6px]"
          }`}
        >
          {message.text}
        </div>

        {/* Book cards */}
        {message.books && message.books.length > 0 && (
          <div className="w-full space-y-2 max-w-[320px]">
            <p className="text-[11px] text-[#A08B6B] font-display tracking-wider uppercase px-1">الكتب المقترحة:</p>
            {message.books.map((book) => (
              <AIBookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Book Card inside AI Response ─────────────────────────
function AIBookCard({ book }: { book: BookResult }) {
  return (
    <div className="bg-white dark:bg-[#14120E] border border-[#F0EBE1] dark:border-[#2A241A] rounded-[16px] p-3 flex gap-3 shadow-sm hover:shadow-md hover:border-[#B8800A]/30 transition-all duration-200">
      {/* Cover */}
      <div className="w-12 h-16 rounded-[8px] bg-[#FAF7F2] dark:bg-[#1E1812] flex-shrink-0 overflow-hidden relative">
        {book.coverImageUrl ? (
          <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#B8800A] text-xl">📚</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-[12px] text-[#0A0806] dark:text-[#F5F0E8] leading-tight line-clamp-2 mb-1">{book.title}</h4>
        <p className="text-[10px] text-[#A08B6B] mb-2">{book.authorName}</p>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[9px] font-display font-bold px-2 py-0.5 rounded-full ${book.isPremium ? "bg-[#B8800A]/10 text-[#B8800A]" : "bg-[#2D6A4F]/10 text-[#2D6A4F]"}`}>
            {book.isPremium ? "مدفوع" : "مجاني"}
          </span>

          <Link
            href={`/books/${book.slug}`}
            className="text-[9px] font-display font-bold px-2 py-0.5 rounded-full bg-[#0A0806] dark:bg-[#F5F0E8] text-white dark:text-[#0A0806] hover:bg-[#B8800A] dark:hover:bg-[#B8800A] dark:hover:text-white transition-colors"
          >
            عرض الكتاب
          </Link>
        </div>
      </div>
    </div>
  );
}
