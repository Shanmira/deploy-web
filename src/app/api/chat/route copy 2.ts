import { NextRequest, NextResponse } from "next/server";
import { STATIC_BPS_DATA, KEYWORD_MAPPING } from "@/lib/data/staticData";

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Deteksi satu tahun dalam query
function detectYear(query: string): string | null {
  const match = query.match(/\b(20[2-4][0-9])\b/);
  return match ? match[0] : null;
}

// Deteksi dua tahun untuk perbandingan
function detectTwoYears(query: string): { year1: string | null; year2: string | null } {
  const years = query.match(/\b(20[2-4][0-9])\b/g);
  if (years && years.length >= 2) {
    return { year1: years[0], year2: years[1] };
  }
  // Pola "dari X ke Y" atau "antara X dan Y"
  const fromTo = query.match(/dari\s+(\d{4})\s+ke\s+(\d{4})/i);
  if (fromTo) return { year1: fromTo[1], year2: fromTo[2] };
  const between = query.match(/antara\s+(\d{4})\s+dan\s+(\d{4})/i);
  if (between) return { year1: between[1], year2: between[2] };
  return { year1: null, year2: null };
}

// Apakah query mengandung permintaan perbandingan?
function isComparisonQuery(query: string): boolean {
  const keywords = ["bandingkan", "perbedaan", "selisih", "naik", "turun", "kenaikan", "penurunan", "dibanding", "dari tahun ke tahun", "tren", "perubahan", "lebih tinggi", "lebih rendah"];
  const lower = query.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

// Deteksi indikator dari query (gunakan mapping keyword)
function detectIndicator(query: string): string | null {
  const lower = query.toLowerCase();
  for (const mapping of KEYWORD_MAPPING) {
    if (mapping.keywords.some(kw => lower.includes(kw))) {
      return mapping.indicator;
    }
  }
  return null;
}

// Ambil data untuk indikator dan tahun tertentu
function getDataForIndicator(indicator: string, year: string): any {
  const dataSet = (STATIC_BPS_DATA as any)[indicator];
  if (!dataSet) return null;
  if (indicator === "profil_daerah") return dataSet;
  return dataSet[year] || null;
}

// Format angka dengan pemisah ribuan
function formatNumber(value: any): string {
  if (typeof value === 'number') return value.toLocaleString('id-ID');
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (!isNaN(num)) return num.toLocaleString('id-ID');
    return value;
  }
  return String(value);
}

// Hitung dan format persentase perubahan
function formatPercentageChange(change: number): string {
  const sign = change > 0 ? 'naik' : change < 0 ? 'turun' : 'stabil';
  return `${sign} ${Math.abs(change).toFixed(2)}%`;
}

// Fungsi utama untuk menghasilkan jawaban perbandingan
function generateComparisonResponse(indicator: string, year1: string, year2: string, data1: any, data2: any): string {
  if (!data1 || !data2) {
    return `Maaf, data untuk ${indicator} tahun ${year1} atau ${year2} tidak tersedia.`;
  }

  // Tentukan field apa saja yang akan dibandingkan untuk setiap indikator
  let fields: string[] = [];
  switch (indicator) {
    case "kependudukan":
      fields = ["total_penduduk", "laki_laki", "perempuan", "kepadatan"];
      break;
    case "kemiskinan":
      fields = ["persentase_penduduk_miskin", "jumlah_penduduk_miskin", "gini_ratio"];
      break;
    case "pdrb":
      fields = ["pdrb_adhb", "pdrb_adhk", "pertumbuhan_ekonomi", "pdrb_per_kapita_adhb"];
      break;
    case "ipm":
      fields = ["nilai", "umur_harapan_hidup", "harapan_lama_sekolah", "rata_rata_lama_sekolah"];
      break;
    case "ketenagakerjaan":
      fields = ["angkatan_kerja", "pengangguran", "tingkat_pengangguran_terbuka", "umk"];
      break;
    case "pendidikan":
      fields = ["angka_melek_huruf", "partisipasi_sekolah_7_12", "jumlah_sd", "jumlah_smp"];
      break;
    case "kesehatan":
      fields = ["angka_harapan_hidup", "balita_gizi_buruk", "jumlah_rumah_sakit"];
      break;
    case "pertanian":
      fields = ["produksi_padi", "produksi_sawit", "produksi_karet"];
      break;
    case "inflasi":
      fields = ["inflasi_yoy"];
      break;
    default:
      return `Perbandingan untuk ${indicator} belum didukung.`;
  }

  let response = `📊 *Perbandingan ${indicator.toUpperCase()} antara tahun ${year1} dan ${year2}:*\n\n`;
  for (const field of fields) {
    const val1 = data1[field];
    const val2 = data2[field];
    if (val1 !== undefined && val2 !== undefined) {
      // Coba konversi ke angka untuk menghitung perubahan
      const num1 = parseFloat(String(val1).replace(/[^0-9.-]/g, ''));
      const num2 = parseFloat(String(val2).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num1) && !isNaN(num2) && num1 !== 0) {
        const diff = num2 - num1;
        const percentChange = (diff / num1) * 100;
        response += `• ${field.replace(/_/g, ' ').toUpperCase()}: ${val1} → ${val2} (${formatPercentageChange(percentChange)})\n`;
      } else {
        response += `• ${field.replace(/_/g, ' ').toUpperCase()}: ${val1} → ${val2}\n`;
      }
    }
  }
  response += `\nSumber: BPS Kabupaten Tanjung Jabung Barat`;
  return response;
}

// ============================================================
// HANDLER UNTUK SAPAAN DAN BANTUAN
// ============================================================
function handleSmallTalk(query: string): string | null {
  const q = query.toLowerCase();
  if (q.includes("halo") || q.includes("hai") || q.includes("hello")) {
    return "Halo! Selamat datang di Asisten Statistik BPS Tanjung Jabung Barat. Ada yang bisa saya bantu? (Contoh: 'jumlah penduduk 2024', 'bandingkan kemiskinan 2022 dan 2023')";
  }
  if (q.includes("terima kasih") || q.includes("makasih")) {
    return "Sama-sama! Senang bisa membantu.";
  }
  if (q.includes("kamu siapa")) {
    return "Saya adalah chatbot resmi BPS Kabupaten Tanjung Jabung Barat yang menyediakan data statistik. Saya bisa menjawab pertanyaan seputar kependudukan, kemiskinan, PDRB, IPM, dan lainnya. Saya juga bisa membandingkan data antar tahun.";
  }
  return null;
}

function getHelpResponse(): string {
  return `🤖 *Asisten Statistik BPS Tanjung Jabung Barat*

Saya dapat menjawab pertanyaan seperti:
• Data tunggal: "Berapa jumlah penduduk 2024?"
• Perbandingan: "Bandingkan kemiskinan 2022 dan 2023"
• Tren: "Apakah PDRB naik dari 2021 ke 2024?"

Indikator yang tersedia: kependudukan, kemiskinan, PDRB, IPM, ketenagakerjaan, pendidikan, kesehatan, pertanian, inflasi.

Coba tanyakan dengan menyebutkan tahun dan indikator.`;
}

// ============================================================
// MAIN POST HANDLER
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Format pesan tidak valid" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content || "";

    // 1. Cek small talk
    const smallTalk = handleSmallTalk(userQuery);
    if (smallTalk) {
      return NextResponse.json({
        reply: smallTalk,
        sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }]
      });
    }

    // 2. Apakah ini pertanyaan perbandingan?
    if (isComparisonQuery(userQuery)) {
      const { year1, year2 } = detectTwoYears(userQuery);
      if (year1 && year2) {
        const indicator = detectIndicator(userQuery);
        if (indicator && indicator !== "profil_daerah") {
          const data1 = getDataForIndicator(indicator, year1);
          const data2 = getDataForIndicator(indicator, year2);
          if (data1 && data2) {
            const reply = generateComparisonResponse(indicator, year1, year2, data1, data2);
            return NextResponse.json({ reply, sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS" }] });
          } else {
            return NextResponse.json({ reply: `Data ${indicator} untuk tahun ${year1} atau ${year2} tidak tersedia.`, sources: [] });
          }
        } else {
          return NextResponse.json({ reply: "Sebutkan indikator yang ingin dibandingkan, misal: 'bandingkan jumlah penduduk 2023 dan 2024'.", sources: [] });
        }
      } else {
        return NextResponse.json({ reply: "Untuk perbandingan, sertakan dua tahun yang berbeda. Contoh: 'bandingkan kemiskinan 2022 dan 2023'.", sources: [] });
      }
    }

    // 3. Jika bukan perbandingan, proses sebagai query tunggal
    const indicator = detectIndicator(userQuery);
    if (!indicator) {
      return NextResponse.json({ reply: getHelpResponse(), sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS" }] });
    }

    let year = detectYear(userQuery);
    if (!year) {
      // Jika tahun tidak disebut, gunakan tahun terbaru yang tersedia untuk indikator tersebut
      const availableYears = Object.keys((STATIC_BPS_DATA as any)[indicator] || {}).filter(y => !isNaN(Number(y)));
      year = availableYears.sort().reverse()[0] || "2024";
    }

    const data = getDataForIndicator(indicator, year);
    if (!data) {
      const availableYears = Object.keys((STATIC_BPS_DATA as any)[indicator] || {});
      return NextResponse.json({ reply: `Data ${indicator} tahun ${year} tidak tersedia. Data tersedia untuk tahun: ${availableYears.join(", ")}.`, sources: [] });
    }

    // Cari mapping untuk memformat output tunggal
    const mapping = KEYWORD_MAPPING.find(m => m.indicator === indicator);
    const reply = mapping ? mapping.getData(data, year) : JSON.stringify(data);
    return NextResponse.json({ reply, sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Maaf, terjadi kesalahan pada server. Silakan coba lagi.", sources: [] }, { status: 500 });
  }
}