import { NextRequest, NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

// Validasi environment variables
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Missing GOOGLE_APPLICATION_CREDENTIALS env");
}
if (!process.env.GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY env");
}

const bigquery = new BigQuery({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

function extractSQL(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/```sql|```/gi, "").trim();
  const match = cleaned.match(/select[\s\S]*$/i);
  return match ? match[0].trim() : cleaned;
}

const FALLBACK_QUERY = `
  SELECT * 
  FROM \`${PROJECT_ID}.chatbot_data.main_table\`
  LIMIT 10
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Format pesan tidak valid" }, { status: 400 });
    }

    const userQuestion = messages[messages.length - 1].content;
    if (!userQuestion) {
      return NextResponse.json({ error: "Pertanyaan kosong" }, { status: 400 });
    }

    // ========== 1. Generate SQL dengan Groq ==========
    let sql = "";
    try {
      const sqlRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          temperature: 0,
          messages: [
            {
              role: "system",
              content: `
Kamu adalah AI generator SQL untuk BigQuery.

Table: \`${PROJECT_ID}.chatbot_data.main_table\`

Kolom:
- var_id (INTEGER)
- metric (STRING)
- title (STRING)
- sub_name (STRING)
- unit (STRING)
- variable (STRING)
- tahun (INTEGER)
- value (FLOAT)

Aturan:
- Hanya output SQL, tanpa penjelasan.
- Tanpa markdown.
- Harus dimulai dengan SELECT.
- Gunakan LIKE untuk pencarian teks.
- Batasi dengan LIMIT 50.
- Jangan gunakan backticks di luar nama tabel.
              `,
            },
            { role: "user", content: userQuestion },
          ],
        }),
      });

      const sqlData = await sqlRes.json();
      const rawSQL = sqlData.choices?.[0]?.message?.content ?? "";
      sql = extractSQL(rawSQL);
      console.log("Generated SQL:", sql);
    } catch (err) {
      console.error("Groq SQL generation error:", err);
    }

    if (!sql || !sql.toLowerCase().includes("select")) {
      console.warn("SQL tidak valid, menggunakan fallback query");
      sql = FALLBACK_QUERY;
    }

    // ========== 2. Query BigQuery ==========
    let queryResult: any[] = [];
    try {
      const [rows] = await bigquery.query({
        query: sql,
        location: "asia-southeast2",
      });
      queryResult = rows;
      console.log(`Query successful, rows: ${queryResult.length}`);
    } catch (err: any) {
      console.error("BigQuery error:", err);
      try {
        console.log("Running fallback query...");
        const [rows] = await bigquery.query({
          query: FALLBACK_QUERY,
          location: "asia-southeast2",
        });
        queryResult = rows;
      } catch (fallbackErr) {
        console.error("Fallback query also failed:", fallbackErr);
        return NextResponse.json({
          reply: "Gagal mengakses database. Periksa koneksi dan izin BigQuery.",
          sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }]
        });
      }
    }

    if (!queryResult || queryResult.length === 0) {
      return NextResponse.json({
        reply: "Data tidak ditemukan untuk pertanyaan Anda. Coba pertanyaan lain.",
        sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }]
      });
    }

    // ========== 3. Generate jawaban dengan Groq ==========
    let reply = "";
    try {
      const answerRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `
Kamu adalah asisten statistik BPS Kabupaten Tanjung Jabung Barat.

Gunakan data berikut untuk menjawab pertanyaan user.
Jawab singkat, jelas, dan profesional dalam Bahasa Indonesia.
Jika ada tahun, sebutkan tahun data.
Jika data berupa angka, format dengan pemisah ribuan.
              `,
            },
            {
              role: "user",
              content: `
Pertanyaan: ${userQuestion}

Data dari BigQuery (dalam format JSON):
${JSON.stringify(queryResult, null, 2)}
              `,
            },
          ],
        }),
      });

      const answerData = await answerRes.json();
      reply = answerData.choices?.[0]?.message?.content ?? "";
      reply = reply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*/g, "");
    } catch (err) {
      console.error("Groq answer generation error:", err);
    }

    // Jika Groq gagal menghasilkan jawaban, buat jawaban manual yang informatif
    if (!reply || reply.trim() === "") {
      // Buat ringkasan dari data yang ada
      const totalRows = queryResult.length;
      const sample = queryResult[0];
      let summary = `Ditemukan ${totalRows} baris data. `;
      if (sample) {
        if (sample.tahun) summary += `Tahun: ${sample.tahun}. `;
        if (sample.metric) summary += `Metrik: ${sample.metric}. `;
        if (sample.value !== undefined) summary += `Nilai: ${sample.value}. `;
        if (sample.title) summary += `Judul: ${sample.title}. `;
      }
      reply = `Berdasarkan data yang tersedia, ${summary}\nSilakan ajukan pertanyaan lebih spesifik untuk detail tambahan.`;
    }

    // Pastikan reply tidak kosong
    if (!reply) reply = "Data berhasil ditemukan, tetapi tidak dapat diformat. Coba lagi.";

    return NextResponse.json({
      reply,
      sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }]
    });

  } catch (error: any) {
    console.error("Route error:", error);
    return NextResponse.json(
      {
        reply: "Maaf, terjadi kesalahan pada server. Silakan coba lagi atau hubungi 082173054213.",
        sources: [{ uri: "https://tanjabbarkab.bps.go.id", title: "BPS Tanjung Jabung Barat" }]
      },
      { status: 500 }
    );
  }
}