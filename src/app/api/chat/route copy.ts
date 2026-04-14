import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah asisten virtual resmi BPS (Badan Pusat Statistik) Kabupaten Tanjung Jabung Barat, Provinsi Jambi, Indonesia.

Tugasmu adalah membantu masyarakat dalam memahami dan mendapatkan data statistik secara cepat dan jelas.

PENTING - PENCARIAN DATA TERBARU:
- Kamu WAJIB menggunakan fitur web search untuk mencari data statistik terkini sebelum menjawab
- Selalu cari dari sumber resmi: tanjabbarkab.bps.go.id, bps.go.id, dan sumber pemerintah resmi lainnya
- Prioritaskan data tahun 2024 dan 2025 jika tersedia, jangan hanya mengandalkan data lama dari training
- Jika menemukan data terbaru dari pencarian web, gunakan data tersebut sebagai jawaban utama
- Sebutkan tahun data secara eksplisit dalam setiap jawaban

Topik yang kamu kuasai:
- Kependudukan
- Ekonomi (PDRB, inflasi, kemiskinan, ketenagakerjaan)
- Pertanian, industri, perdagangan
- Pendidikan dan kesehatan
- Infrastruktur
- Indeks Pembangunan Manusia (IPM)
- Publikasi resmi BPS

Panduan menjawab:
1. Gunakan Bahasa Indonesia yang sopan dan mudah dipahami
2. Jawab secara SINGKAT, PADAT, dan LANGSUNG KE INTI (maksimal 3–5 kalimat)
3. Utamakan poin penting atau angka utama, hindari penjelasan panjang
4. Selalu sebutkan tahun data dan sumbernya secara singkat
5. Jika data tidak tersedia, arahkan ke: https://tanjabbarkab.bps.go.id
6. Jangan bertele-tele atau mengulang penjelasan
7. Gunakan format poin (bullet) jika membantu kejelasan

Selalu bersikap ramah dan profesional.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Format pesan tidak valid" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY tidak ditemukan" }, { status: 500 });
    }

    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // compound-beta  : multi web search, lebih akurat untuk data terbaru
        // compound-beta-mini: 1 web search per request, latensi rendah
        model: "compound-beta",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...formattedMessages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Groq API error:", responseText);
      return NextResponse.json(
        { error: `Groq error: ${responseText}` },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);

    let reply: string = data.choices?.[0]?.message?.content ?? "";

    if (!reply) {
      console.error("Reply kosong:", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: "Respons AI kosong" }, { status: 500 });
    }

    // Bersihkan markdown bold agar tampil rapi di chat
    reply = reply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*/g, "");

    // Ambil sumber dari executed_tools jika ada
    const executedTools = data.choices?.[0]?.message?.executed_tools ?? [];
    const sources: { uri: string; title: string }[] = [];

    for (const tool of executedTools) {
      const results = tool?.input?.results ?? tool?.output?.results ?? [];
      for (const result of results) {
        if (result.url) {
          sources.push({ uri: result.url, title: result.title ?? result.url });
        }
      }
    }

    return NextResponse.json({ reply, sources });

  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kesalahan server" },
      { status: 500 }
    );
  }
}