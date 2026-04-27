"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, User, AlertTriangle, Clock } from "lucide-react";
import Image from "next/image";

interface Props {
  onClose: () => void;
}

interface Message {
  text: string;
  sender: "bot" | "user";
  time: string;
  sources?: { uri: string; title: string }[];
}

// ============================================================
// RATE LIMIT STATE — disimpan di module level agar persisten
// selama sesi (tidak hilang saat komponen re-render)
// ============================================================
let globalRateLimitUntil: number | null = null; // timestamp ms kapan bisa dipakai lagi

const getCurrentTime = () => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const generateDynamicSuggestions = (userQuery: string, botReply: string): string[] => {
  const lowerQuery = userQuery.toLowerCase();

  if (lowerQuery.includes("penduduk") || lowerQuery.includes("jiwa")) {
    return [
      "Berapa jumlah penduduk laki-laki?",
      "Bagaimana kepadatan penduduk?",
      "Perbandingan penduduk antar tahun",
      "Data rumah tangga",
    ];
  }
  if (lowerQuery.includes("kemiskinan") || lowerQuery.includes("miskin")) {
    return [
      "Apa itu Gini Ratio?",
      "Tren kemiskinan 5 tahun terakhir",
      "Garis kemiskinan terbaru",
      "Perbandingan kemiskinan antar kabupaten",
    ];
  }
  if (lowerQuery.includes("pdrb") || lowerQuery.includes("ekonomi")) {
    return [
      "PDRB per kapita terbaru",
      "Sektor ekonomi terbesar",
      "Pertumbuhan ekonomi tahun lalu",
      "Kontribusi sektor pertanian",
    ];
  }
  if (lowerQuery.includes("ipm") || lowerQuery.includes("pembangunan manusia")) {
    return [
      "Komponen IPM",
      "Harapan hidup saat lahir",
      "Rata-rata lama sekolah",
      "IPM dibanding provinsi",
    ];
  }
  if (lowerQuery.includes("umk") || lowerQuery.includes("upah")) {
    return [
      "UMK tahun sebelumnya",
      "UMK kabupaten tetangga",
      "Tingkat pengangguran",
      "Jumlah angkatan kerja",
    ];
  }
  return [
    "Data kependudukan terbaru",
    "Informasi kemiskinan",
    "Statistik PDRB",
    "Tentang IPM",
    "Ketenagakerjaan dan UMK",
  ];
};

// ============================================================
// HELPER: Format detik menjadi "X menit Y detik"
// ============================================================
function formatDuration(seconds: number): string {
  if (seconds <= 0) return "sebentar lagi";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0 && s > 0) return `${m} menit ${s} detik`;
  if (m > 0) return `${m} menit`;
  return `${s} detik`;
}

export default function Chatbot({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      text: "Hai 👋 Selamat datang di BPS Tanjung Jabung Barat. Ada yang bisa saya bantu?",
      sender: "bot",
      time: getCurrentTime(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // showSuggestions hanya true saat awal (hanya ada pesan sambutan)
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Berapa jumlah penduduk Tanjung Jabung Barat?",
    "Apa data PDRB terbaru?",
    "Bagaimana angka kemiskinan di Tanjabbarat?",
    "Berapa nilai IPM Tanjung Jabung Barat?",
    "Di mana saya bisa akses publikasi BPS?",
  ]);

  // State countdown rate limit
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // Cek apakah saat ini sedang dalam kondisi rate limited
  // ============================================================
  const isRateLimited = rateLimitCountdown > 0;

  // ============================================================
  // Mulai countdown dari secondsRemaining
  // ============================================================
  const startCountdown = useCallback((secondsRemaining: number) => {
    // Set ke global agar persisten
    globalRateLimitUntil = Date.now() + secondsRemaining * 1000;

    setRateLimitCountdown(secondsRemaining);

    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      const remaining = Math.ceil((globalRateLimitUntil! - Date.now()) / 1000);
      if (remaining <= 0) {
        setRateLimitCountdown(0);
        globalRateLimitUntil = null;
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      } else {
        setRateLimitCountdown(remaining);
      }
    }, 1000);
  }, []);

  // ============================================================
  // Saat mount — cek apakah ada rate limit yang masih aktif
  // ============================================================
  useEffect(() => {
    if (globalRateLimitUntil) {
      const remaining = Math.ceil((globalRateLimitUntil - Date.now()) / 1000);
      if (remaining > 0) {
        startCountdown(remaining);
      } else {
        globalRateLimitUntil = null;
      }
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [startCountdown]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const sendMessage = async () => {
    // Blokir pengiriman jika rate limited
    if (isRateLimited || !input.trim() || isLoading) return;

    // Sembunyikan suggestion setelah user mengirim pesan pertama
    setShowSuggestions(false);

    const userText = input.trim();
    const timeNow = getCurrentTime();

    const userMessage: Message = {
      text: userText,
      sender: "user",
      time: timeNow,
    };

    const tempMessages = [...messages, userMessage];
    setMessages(tempMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = tempMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      const data = await response.json();

      // *** Deteksi rate limit dari server ***
      if (response.status === 429 || data.rateLimitExceeded === true) {
        const retryAfter: number = data.retryAfterSeconds ?? 900;
        startCountdown(retryAfter);

        // Tambahkan pesan bot yang menjelaskan situasi
        setMessages((prev) => [
          ...prev,
          {
            text: `⚠️ Batas penggunaan harian asisten telah tercapai.\n\nSilakan coba lagi dalam ${formatDuration(retryAfter)}. Anda tetap dapat mengakses data statistik di:\n- https://tanjabbarkab.bps.go.id\n- Hubungi BPS: 082173054213`,
            sender: "bot",
            time: getCurrentTime(),
            sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }],
          },
        ]);

        setIsLoading(false);
        return;
      }

      if (!data.reply) {
        throw new Error(data.error || "Gagal mendapatkan response");
      }

      const botMessage: Message = {
        text: data.reply,
        sender: "bot",
        time: getCurrentTime(),
        sources: data.sources ?? [],
      };

      setMessages((prev) => [...prev, botMessage]);

      // Opsional: perbarui saran jika suatu saat ingin ditampilkan kembali secara manual
      // tapi kita tidak akan menampilkannya lagi di sini
      const newSuggestions = generateDynamicSuggestions(userText, data.reply);
      setSuggestions(newSuggestions);
      // Tidak setShowSuggestions(true) lagi
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan.";
      setMessages((prev) => [
        ...prev,
        {
          text: `Maaf, terjadi gangguan: ${errorMessage}\n\nSilakan coba lagi atau hubungi kami di 082173054213.`,
          sender: "bot",
          time: getCurrentTime(),
        },
      ]);
      // Tidak menampilkan suggestion lagi saat error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    if (isRateLimited) return;
    setInput(text);
    // Sembunyikan suggestion setelah user memilih salah satu
    setShowSuggestions(false);
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="w-full max-w-md h-screen md:h-[90vh] bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <Image src="/assets/images/logo-bps.webp" alt="BPS" width={24} height={24} className="object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold">BPS Tanjung Jabung Barat</p>
                <p className="text-xs text-blue-100">🟢 Online · Asisten Statistik</p>
              </div>
            </div>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* ============================================================
              BANNER RATE LIMIT — muncul di bawah header saat rate limited
          ============================================================ */}
          {isRateLimited && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-800">
                  Batas harian tercapai
                </p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Asisten tidak dapat menerima pertanyaan baru saat ini.
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock size={12} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-600 font-medium">
                    Tersedia kembali dalam{" "}
                    <span className="font-bold tabular-nums">
                      {formatDuration(rateLimitCountdown)}
                    </span>
                  </p>
                </div>
                <a
                  href="https://tanjabbarkab.bps.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-blue-600 underline"
                >
                  Cari data di tanjabbarkab.bps.go.id →
                </a>
              </div>
            </div>
          )}

          {/* CHAT AREA */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "bot" && (
                  <div className="flex gap-2 max-w-[95%]">
                    <div className="w-20 h-7 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                      <Image src="/assets/images/logo-bps.webp" alt="bot" width={20} height={20} className="object-contain" />
                    </div>
                    <div>
                      <div className="bg-white p-3 rounded-xl shadow text-sm whitespace-pre-wrap">
                        {formatTextWithLinks(msg.text)}
                      </div>
                      {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-400">Sumber:</p>
                          {msg.sources.slice(0, 3).map((src, idx) => {
                            if (!src?.uri) return null;
                            return (
                              <a key={idx} href={src.uri} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-500 hover:underline truncate">
                                🔗 {src.title?.trim() || src.uri}
                              </a>
                            );
                          })}
                        </div>
                      )}
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                  </div>
                )}
                {msg.sender === "user" && (
                  <div className="flex items-end gap-2 max-w-[75%]">
                    <div className="text-right">
                      <div className="bg-blue-600 text-white p-3 rounded-xl text-sm">{formatTextWithLinks(msg.text)}</div>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && <div className="text-sm text-gray-400">Mengetik...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-3 border-t">
            {/* Saran — hanya muncul jika showSuggestions true dan tidak dalam rate limited */}
            {showSuggestions && suggestions.length > 0 && !isRateLimited && (
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1.5">
                  Pertanyaan umum:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input field — dinonaktifkan saat rate limited */}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => {
                  if (!isRateLimited) setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && !isRateLimited) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  isRateLimited
                    ? `Tersedia kembali dalam ${formatDuration(rateLimitCountdown)}...`
                    : "Tulis pertanyaan..."
                }
                disabled={isRateLimited}
                className={`flex-1 px-4 py-2 border rounded-full text-sm transition-colors ${
                  isRateLimited
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 placeholder-amber-500"
                    : "bg-white text-gray-800"
                }`}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || isRateLimited}
                title={isRateLimited ? `Coba lagi dalam ${formatDuration(rateLimitCountdown)}` : "Kirim"}
                className={`p-2 rounded-full transition-colors ${
                  isRateLimited
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                } text-white`}
              >
                {isRateLimited ? (
                  <Clock size={16} />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}