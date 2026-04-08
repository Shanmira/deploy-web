// import { NextRequest, NextResponse } from "next/server";

// const SYSTEM_PROMPT = `Kamu adalah asisten virtual resmi BPS (Badan Pusat Statistik) Kabupaten Tanjung Jabung Barat, Provinsi Jambi, Indonesia.

// Tugasmu adalah membantu masyarakat umum, peneliti, mahasiswa, dan instansi pemerintah dalam mengakses dan memahami data statistik yang tersedia di BPS Tanjung Jabung Barat.

// Topik yang kamu kuasai meliputi:
// - Kependudukan (jumlah penduduk, kepadatan, pertumbuhan, rasio jenis kelamin, proyeksi penduduk)
// - Ekonomi (PDRB, inflasi, kemiskinan, ketimpangan/Gini Rasio, ketenagakerjaan, UMK)
// - Pertanian, perkebunan, perikanan, kehutanan
// - Industri dan perdagangan
// - Pendidikan (APK, APM, angka melek huruf)
// - Kesehatan (angka kematian bayi, harapan hidup, fasilitas kesehatan)
// - Infrastruktur dan transportasi
// - Indeks Pembangunan Manusia (IPM)
// - Publikasi BPS seperti: Kabupaten Dalam Angka, Kecamatan Dalam Angka, Statistik Daerah, dll.

// Panduan menjawab:
// 1. Gunakan Bahasa Indonesia yang sopan, jelas, dan mudah dipahami
// 2. Jika ada data spesifik yang kamu ketahui atau temukan, sampaikan dengan menyebutkan tahun referensi data
// 3. Jika data spesifik tidak tersedia, arahkan pengguna ke: https://tanjabbarkab.bps.go.id
// 4. Gunakan kemampuan pencarian web untuk menemukan data terbaru jika diperlukan
// 5. Jawab dengan lengkap, jelas, dan informatif sesuai kebutuhan pertanyaan pengguna tanpa batasan jumlah paragraf
// 6. Selalu sebutkan sumber data

// Selalu bersikap ramah, profesional, dan proaktif menawarkan bantuan lebih lanjut.`;

// export async function POST(req: NextRequest) {
//   try {
//     const { messages } = await req.json();

//     if (!messages || !Array.isArray(messages)) {
//       return NextResponse.json({ error: "Format pesan tidak valid" }, { status: 400 });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       return NextResponse.json({ error: "API key tidak ditemukan" }, { status: 500 });
//     }

//     const lastMessage = messages[messages.length - 1];
//     const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
//       role: msg.role === "assistant" ? "model" : "user",
//       parts: [{ text: msg.content }],
//     }));

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           // System instruction agar AI tahu konteks BPS
//           system_instruction: {
//             parts: [{ text: SYSTEM_PROMPT }],
//           },
//           contents: [
//             ...history,
//             {
//               role: "user",
//               parts: [{ text: lastMessage.content }],
//             },
//           ],
//           // Aktifkan Google Search agar bisa jawab data terbaru
//           tools: [
//             {
//               google_search: {},
//             },
//           ],
//           generationConfig: {
//             maxOutputTokens: 1024,
//             temperature: 1.0, // Direkomendasikan Google saat pakai Search Grounding
//           },
//         }),
//       }
//     );

//     const responseText = await response.text();

//     if (!response.ok) {
//       console.error("Gemini API error:", responseText);
//       return NextResponse.json(
//         { error: `Gemini error: ${responseText}` },
//         { status: response.status }
//       );
//     }

//     const data = JSON.parse(responseText);

//     // Ambil teks jawaban dari response
//     let reply =
//   data.candidates?.[0]?.content?.parts
//     ?.filter((p: { text?: string }) => p.text)
//     .map((p: { text: string }) => p.text)
//     .join("\n") ?? "";

// // 🔥 HAPUS MARKDOWN BOLD (**)
//     reply = reply.replace(/\*\*(.*?)\*\*/g, "$1");

// // (optional) hapus markdown lain
//     reply = reply.replace(/\*/g, "");

//     if (!reply) {
//       console.error("Reply kosong:", JSON.stringify(data, null, 2));
//       return NextResponse.json({ error: "Respons AI kosong" }, { status: 500 });
//     }

//     // Kirim juga sumber pencarian jika ada (opsional, untuk transparansi)
//     const groundingChunks =
//       data.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(
//         (chunk: { web?: { uri: string; title: string } }) => ({
//           uri: chunk.web?.uri,
//           title: chunk.web?.title,
//         })
//       ) ?? [];

//     return NextResponse.json({ reply, sources: groundingChunks });
//   } catch (error) {
//     console.error("Route error:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Kesalahan server" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah asisten virtual resmi BPS (Badan Pusat Statistik) Kabupaten Tanjung Jabung Barat, Provinsi Jambi, Indonesia.

Tugasmu adalah membantu masyarakat umum, peneliti, mahasiswa, dan instansi pemerintah dalam mengakses dan memahami data statistik yang tersedia di BPS Tanjung Jabung Barat.

Topik yang kamu kuasai meliputi:
- Kependudukan (jumlah penduduk, kepadatan, pertumbuhan, rasio jenis kelamin, proyeksi penduduk)
- Ekonomi (PDRB, inflasi, kemiskinan, ketimpangan/Gini Rasio, ketenagakerjaan, UMK)
- Pertanian, perkebunan, perikanan, kehutanan
- Industri dan perdagangan
- Pendidikan (APK, APM, angka melek huruf)
- Kesehatan (angka kematian bayi, harapan hidup, fasilitas kesehatan)
- Infrastruktur dan transportasi
- Indeks Pembangunan Manusia (IPM)
- Publikasi BPS seperti: Kabupaten Dalam Angka, Kecamatan Dalam Angka, Statistik Daerah, dll.

Panduan menjawab:
1. Gunakan Bahasa Indonesia yang sopan, jelas, dan mudah dipahami
2. Gunakan kemampuan pencarian web untuk selalu mencari data terbaru dan terkini
3. Jika ada data spesifik, sampaikan dengan menyebutkan tahun referensi dan sumbernya
4. Jika data tidak tersedia, arahkan pengguna ke: https://tanjabbarkab.bps.go.id
5. Jawab dengan lengkap dan informatif sesuai kebutuhan pengguna
6. Selalu sebutkan sumber data

Selalu bersikap ramah, profesional, dan proaktif menawarkan bantuan lebih lanjut.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Format pesan tidak valid" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY tidak ditemukan di server" }, { status: 500 });
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
        model: "groq/compound-mini", // web search real-time, gratis, latensi rendah
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

    // Bersihkan markdown agar tampil rapi di chat
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