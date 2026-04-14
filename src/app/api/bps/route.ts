import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: "Query diperlukan" }, { status: 400 });
    }
    
    // Path ke script Python
    const scriptPath = path.join(process.cwd(), "scripts", "bps_fetcher.py");
    
    // Panggil script Python
    const { stdout, stderr } = await execAsync(`python ${scriptPath} "${query}"`);
    
    if (stderr) {
      console.error("Python error:", stderr);
      return NextResponse.json({ error: "Gagal mengambil data BPS" }, { status: 500 });
    }
    
    // Parse output JSON dari Python
    const data = JSON.parse(stdout);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}