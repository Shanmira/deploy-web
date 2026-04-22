import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

// ============================================================
// INISIALISASI
// ============================================================
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL_FAST = "llama-3.1-8b-instant";
const GROQ_MODEL_SMART = "llama-3.3-70b-versatile";
const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: PROJECT_ID,
});

// ============================================================
// REFERENSI TABEL
// ============================================================
// const TABLE_REF = "`" + PROJECT_ID + ".chatbot_data.main_table`";
const TABLE_REF = "`" + PROJECT_ID + ".chatbot_resource.source-chatbot`";

// ============================================================
// SCHEMA LENGKAP
// ============================================================
const TABLE_SCHEMA = `
Table: ${TABLE_REF}

Kolom:
- var_id   : INTEGER  — ID variabel
- metric   : STRING   — kode unik metrik, berisi kata kunci topik
- title    : STRING   — judul tabel statistik
- sub_name : STRING   — label baris data: jenis kelamin, kelompok umur, kecamatan, dll
- unit     : STRING   — satuan nilai (jiwa, persen, rupiah, ha, dll)
- variable : STRING   — nama variabel/kolom dalam tabel
- kategori : STRING   — kategori topik (kependudukan, ekonomi, pertanian, dll)
- tahun    : INTEGER  — tahun data
- value    : FLOAT    — nilai numerik

CARA DATA DISIMPAN (PENTING):
- Data detail seperti "laki-laki", "perempuan", "total" tersimpan di kolom sub_name, BUKAN di title
- Contoh: title="Jumlah Penduduk Menurut Jenis Kelamin", sub_name="Laki-Laki", tahun=2023, value=163234
- Contoh: title="Jumlah Penduduk Menurut Jenis Kelamin", sub_name="Perempuan", tahun=2023, value=158222
- Contoh: title="Jumlah Penduduk Menurut Jenis Kelamin", sub_name="Jumlah", tahun=2023, value=321456
- Untuk data "terbaru", gunakan subquery MAX(tahun) atau ORDER BY tahun DESC LIMIT
`;

// ============================================================
// SYSTEM PROMPT SQL
// ============================================================
const SQL_SYSTEM_PROMPT = `
Kamu adalah generator SQL untuk Google BigQuery.

${TABLE_SCHEMA}

ATURAN WAJIB — WAJIB DIIKUTI SEMUA:
1. Output HANYA SQL murni. DILARANG ada teks, penjelasan, atau markdown.
2. Query HARUS dimulai langsung dengan SELECT.
3. SELALU pilih semua kolom konteks: SELECT var_id, metric, title, sub_name, unit, variable, kategori, tahun, value
4. JANGAN hanya SELECT value — tanpa kolom lain jawaban tidak bisa dibuat.
5. Untuk pencarian teks, cari di SEMUA kolom relevan dengan OR:
   WHERE LOWER(title) LIKE '%kata%' OR LOWER(metric) LIKE '%kata%' OR LOWER(sub_name) LIKE '%kata%' OR LOWER(kategori) LIKE '%kata%'
6. Untuk pertanyaan "jumlah penduduk" tanpa spesifikasi, ambil semua sub_name termasuk total/jumlah:
   WHERE (LOWER(title) LIKE '%penduduk%' OR LOWER(metric) LIKE '%penduduk%') ORDER BY tahun DESC LIMIT 20
7. Untuk pertanyaan "laki-laki" atau "perempuan", cari di sub_name:
   WHERE LOWER(sub_name) LIKE '%laki%' AND (LOWER(title) LIKE '%penduduk%' OR LOWER(metric) LIKE '%penduduk%')
8. Untuk data TERBARU tanpa menyebut tahun, gunakan:
   WHERE tahun = (SELECT MAX(tahun) FROM ${TABLE_REF} WHERE kondisi_relevan)
9. LIMIT maksimal 30.
10. Nama tabel: ${TABLE_REF}
`;

// ============================================================
// SYSTEM PROMPT JAWABAN
// ============================================================
const ANSWER_SYSTEM_PROMPT = `
Kamu adalah asisten statistik resmi BPS Kabupaten Tanjung Jabung Barat, Provinsi Jambi.

Tugasmu menjawab pertanyaan user berdasarkan data dari database BPS.

PANDUAN MENJAWAB:
- Gunakan Bahasa Indonesia yang ramah, jelas, dan profesional.
- SELALU sebutkan tahun data.
- Format angka dengan pemisah ribuan Indonesia (contoh: 163.234 bukan 163234).
- Jika ada beberapa baris data (misal laki-laki dan perempuan), tampilkan semua secara terstruktur.
- Jika ada tren beberapa tahun, jelaskan trennya (naik/turun berapa persen/angka).
- Jika data yang diminta tidak ada, katakan dengan jujur dan arahkan ke https://tanjabbarkab.bps.go.id
- Jangan menyebut BigQuery, SQL, database, atau istilah teknis kepada user.
- Akhiri dengan menawarkan bantuan lebih lanjut.
`;

// ============================================================
// TIPE KHUSUS UNTUK RATE LIMIT ERROR
// ============================================================
class RateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// ============================================================
// HELPER: Parse retry-after dari pesan error Groq
// ============================================================
function parseRetryAfter(errorMessage: string): number {
  // Format: "Please try again in 12m16.127999999s"
  const matchMin = errorMessage.match(/try again in\s+(\d+)m(\d+(?:\.\d+)?)s/i);
  if (matchMin) {
    const minutes = parseInt(matchMin[1], 10);
    const seconds = parseFloat(matchMin[2]);
    return Math.ceil(minutes * 60 + seconds);
  }
  // Format: "Please try again in 45.5s"
  const matchSec = errorMessage.match(/try again in\s+(\d+(?:\.\d+)?)s/i);
  if (matchSec) {
    return Math.ceil(parseFloat(matchSec[1]));
  }
  // Default fallback: 15 menit
  return 900;
}

// ============================================================
// HELPER: Panggil Groq dengan error handling lengkap
// ============================================================
async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  label: string,
  model: string
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error(`${label}: GROQ_API_KEY tidak dikonfigurasi`);

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  console.log(`[${label}] HTTP status: ${res.status}`);

  if (res.status === 429) {
    const errText = await res.text();
    console.error(`[${label}] Rate limit exceeded: ${errText}`);
    const retryAfter = parseRetryAfter(errText);
    throw new RateLimitError(
      `Token harian habis. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.`,
      retryAfter
    );
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[${label}] Error response: ${errText}`);
    throw new Error(`${label} HTTP ${res.status}: ${errText.substring(0, 300)}`);
  }

  const data = await res.json();

  if (data.usage) {
    console.log(`[${label}] Tokens — prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens}`);
  }

  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) {
    console.error(`[${label}] Response kosong:`, JSON.stringify(data));
    throw new Error(`${label} menghasilkan respons kosong`);
  }

  return content.trim();
}

// ============================================================
// HELPER: Bersihkan SQL dari markdown
// ============================================================
function extractSQL(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.replace(/```(?:sql)?[\s\S]*?```/gi, (match) =>
    match.replace(/```(?:sql)?/gi, "").replace(/```/g, "")
  );
  cleaned = cleaned.replace(/```/g, "").trim();
  const selectMatch = cleaned.match(/SELECT[\s\S]+/i);
  if (!selectMatch) {
    console.error("[SQL Extract] Tidak ditemukan SELECT dalam:", cleaned.substring(0, 300));
    return "";
  }
  const sql = selectMatch[0].trim();
  console.log("[SQL Extract] Hasil:", sql.substring(0, 300));
  return sql;
}

// ============================================================
// HELPER: Buat SQL fallback berbasis keyword
// ============================================================
function buildKeywordSQL(question: string): string {
  const q = question.toLowerCase();

  const stopwords = new Set([
    "berapa", "apa", "siapa", "dimana", "kapan", "bagaimana", "yang",
    "dan", "atau", "di", "ke", "dari", "untuk", "dengan", "pada",
    "adalah", "data", "tanjung", "jabung", "barat", "tanjabbarat",
    "kabupaten", "kab", "bps", "statistik", "tolong", "mohon", "saya",
  ]);

  const keywords = q
    .replace(/[^a-z0-9\s\-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w))
    .slice(0, 4);

  console.log("[Keyword SQL] Keywords:", keywords);

  if (keywords.length === 0) {
    return `SELECT var_id, metric, title, sub_name, unit, variable, kategori, tahun, value FROM ${TABLE_REF} ORDER BY tahun DESC LIMIT 20`;
  }

  const conditions = keywords.map((k) =>
    `(LOWER(title) LIKE '%${k}%' OR LOWER(metric) LIKE '%${k}%' OR LOWER(sub_name) LIKE '%${k}%' OR LOWER(kategori) LIKE '%${k}%' OR LOWER(variable) LIKE '%${k}%')`
  );

  const whereClause = conditions.join(" AND ");

  return `SELECT var_id, metric, title, sub_name, unit, variable, kategori, tahun, value FROM ${TABLE_REF} WHERE ${whereClause} ORDER BY tahun DESC LIMIT 30`;
}

// ============================================================
// HELPER: Format baris BigQuery menjadi teks
// ============================================================
function formatQueryResult(rows: any[]): string {
  if (!rows || rows.length === 0) return "Tidak ada data.";

  const sample = rows.slice(0, 30);

  const grouped: Record<string, any[]> = {};
  for (const row of sample) {
    const key = `${row.title ?? ""}|${row.tahun ?? ""}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  const lines: string[] = [];
  let idx = 1;
  for (const [key, groupRows] of Object.entries(grouped)) {
    const [title, tahun] = key.split("|");
    if (title || tahun) {
      lines.push(`\n[Topik: "${title}" | Tahun: ${tahun}]`);
    }
    for (const row of groupRows) {
      const parts: string[] = [];
      if (row.sub_name) parts.push(`sub_name="${row.sub_name}"`);
      if (row.variable && row.variable !== row.sub_name) parts.push(`variable="${row.variable}"`);
      if (row.value !== undefined && row.value !== null) parts.push(`value=${row.value}`);
      if (row.unit) parts.push(`unit=${row.unit}`);
      if (row.kategori) parts.push(`kategori=${row.kategori}`);
      lines.push(`  ${idx}. ${parts.join(", ")}`);
      idx++;
    }
  }

  return lines.join("\n");
}

// ============================================================
// HELPER: Deteksi sapaan / terima kasih
// ============================================================
function detectSmallTalk(query: string): string | null {
  const q = query.toLowerCase().trim();
  const greetings = ["halo", "hai", "hello", "assalamualaikum", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "hi", "hey"];
  if (greetings.some((g) => q === g || q.startsWith(g + " ") || q.startsWith(g + "!"))) {
    return q.includes("assalamualaikum")
      ? "Wa'alaikumsalam! Selamat datang di Asisten Statistik BPS Tanjung Jabung Barat. Ada yang bisa saya bantu?"
      : "Halo! Selamat datang di Asisten Statistik BPS Tanjung Jabung Barat.\n\nSaya dapat membantu mencari data:\n- Kependudukan\n- Ketenagakerjaan & UMK\n- Kemiskinan & ekonomi\n- Pertanian & perkebunan\n- Pendidikan & kesehatan\n\nSilakan ajukan pertanyaan Anda!";
  }
  const thanks = ["terima kasih", "makasih", "thanks", "thank you", "trims"];
  if (thanks.some((t) => q.includes(t))) {
    return "Sama-sama! Senang bisa membantu. Jika ada pertanyaan lain seputar data statistik BPS Tanjung Jabung Barat, jangan ragu untuk bertanya.";
  }
  return null;
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

    const userQuestion: string = messages[messages.length - 1]?.content ?? "";
    if (!userQuestion.trim()) {
      return NextResponse.json({ error: "Pertanyaan kosong" }, { status: 400 });
    }

    console.log("\n========== REQUEST ==========");
    console.log("User:", userQuestion);

    // --- Tangani sapaan ---
    const smallTalk = detectSmallTalk(userQuestion);
    if (smallTalk) {
      return NextResponse.json({
        reply: smallTalk,
        sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }],
      });
    }

    // ========== LANGKAH 1: Generate SQL ==========
    console.log("[Step 1] Generating SQL...");
    let sql = "";

    try {
      const rawSQL = await callGroq(SQL_SYSTEM_PROMPT, userQuestion, 0, "Groq-SQL", GROQ_MODEL_FAST);
      sql = extractSQL(rawSQL);
    } catch (err) {
      // Jika step 1 (SQL generation) kena rate limit, lempar langsung
      if (err instanceof RateLimitError) {
        console.error("[Step 1] Rate limit saat generate SQL");
        return NextResponse.json(
          {
            reply: "Rate limit tercapai.",
            rateLimitExceeded: true,
            retryAfterSeconds: err.retryAfterSeconds,
          },
          { status: 429 }
        );
      }
      console.error("[Step 1] SQL generation failed:", err);
    }

    // Validasi SQL
    const isValidSQL =
      sql.trim().toLowerCase().startsWith("select") &&
      !sql.trim().toLowerCase().startsWith("select value") &&
      !sql.trim().toLowerCase().startsWith("select\nvalue");

    if (!isValidSQL) {
      console.warn("[Step 1] SQL tidak valid, pakai keyword SQL");
      sql = buildKeywordSQL(userQuestion);
    }

    console.log("[Step 1] Final SQL:", sql);

    // ========== LANGKAH 2: Query BigQuery ==========
    console.log("[Step 2] Querying BigQuery...");
    let queryResult: any[] = [];

    try {
      const [rows] = await bigquery.query({
        query: sql,
        location: "asia-southeast2",
      });
      queryResult = rows ?? [];
      console.log(`[Step 2] Query OK. Rows returned: ${queryResult.length}`);
    } catch (err: any) {
      console.error("[Step 2] BigQuery error:", err?.message ?? err);

      try {
        const fallbackSQL = buildKeywordSQL(userQuestion);
        console.log("[Step 2] Trying keyword fallback SQL...");
        const [rows] = await bigquery.query({
          query: fallbackSQL,
          location: "asia-southeast2",
        });
        queryResult = rows ?? [];
        console.log(`[Step 2] Fallback OK. Rows: ${queryResult.length}`);
      } catch (fallbackErr: any) {
        console.error("[Step 2] Fallback juga gagal:", fallbackErr?.message);
        return NextResponse.json({
          reply: "Maaf, saat ini sistem tidak dapat mengakses database. Silakan coba beberapa saat lagi atau kunjungi https://tanjabbarkab.bps.go.id.",
          sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }],
        });
      }
    }

    if (queryResult.length === 0) {
      try {
        const broadSQL = buildKeywordSQL(userQuestion).replace(/ AND /g, " OR ");
        console.log("[Step 2] Retry dengan kondisi OR lebih longgar...");
        const [rows] = await bigquery.query({ query: broadSQL, location: "asia-southeast2" });
        queryResult = rows ?? [];
        console.log(`[Step 2] Broad retry rows: ${queryResult.length}`);
      } catch {
        // abaikan
      }
    }

    if (queryResult.length === 0) {
      return NextResponse.json({
        reply: `Maaf, data untuk "${userQuestion}" tidak ditemukan dalam database BPS Tanjung Jabung Barat.\n\nCoba pertanyaan dengan kata kunci yang berbeda, atau kunjungi:\n- https://tanjabbarkab.bps.go.id\n- Hubungi BPS: 082173054213`,
        sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }],
      });
    }

    // ========== LANGKAH 3: Generate jawaban natural ==========
    console.log("[Step 3] Generating natural language answer...");

    const formattedData = formatQueryResult(queryResult);
    const userPromptForAnswer = `
Pertanyaan user: "${userQuestion}"

Data dari database BPS (${queryResult.length} baris):
${formattedData}

Jawab pertanyaan user berdasarkan data di atas. Tampilkan angka secara terstruktur dan sebutkan tahunnya.
`.trim();

    let reply = "";
    try {
      reply = await callGroq(ANSWER_SYSTEM_PROMPT, userPromptForAnswer, 0.3, "Groq-Answer", GROQ_MODEL_SMART);
      reply = reply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*/g, "").trim();
      console.log("[Step 3] Answer generated, length:", reply.length);
    } catch (err) {
      // *** RATE LIMIT: kembalikan response 429 khusus ***
      if (err instanceof RateLimitError) {
        console.error("[Step 3] Rate limit saat generate jawaban");
        return NextResponse.json(
          {
            reply: "Rate limit tercapai.",
            rateLimitExceeded: true,
            retryAfterSeconds: err.retryAfterSeconds,
          },
          { status: 429 }
        );
      }

      console.error("[Step 3] Answer generation failed:", err);

      // Fallback manual
      const years = [...new Set(queryResult.map((r) => r.tahun).filter(Boolean))].sort((a: number, b: number) => b - a);
      const latestYear = years[0];
      const latestRows = queryResult.filter((r) => r.tahun === latestYear);

      reply = `Berikut data terkait pertanyaan Anda`;
      if (latestYear) reply += ` (tahun ${latestYear})`;
      reply += ":\n\n";

      for (const row of latestRows.slice(0, 10)) {
        const label = row.sub_name || row.variable || row.title || "-";
        const val = row.value !== undefined
          ? Number(row.value).toLocaleString("id-ID")
          : "-";
        const unit = row.unit ? ` ${row.unit}` : "";
        reply += `- ${label}: ${val}${unit}\n`;
      }

      if (years.length > 1) {
        reply += `\nData tersedia untuk tahun: ${years.join(", ")}.`;
      }
      reply += `\n\nUntuk data lengkap: https://tanjabbarkab.bps.go.id atau hubungi 082173054213.`;
    }

    console.log("========== DONE ==========\n");

    return NextResponse.json({
      reply,
      sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }],
    });

  } catch (error: any) {
    console.error("[Route] Unhandled error:", error?.message ?? error);
    return NextResponse.json(
      {
        reply: "Maaf, terjadi kesalahan tidak terduga. Silakan coba lagi atau hubungi BPS di 082173054213.",
        sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }],
      },
      { status: 500 }
    );
  }
}