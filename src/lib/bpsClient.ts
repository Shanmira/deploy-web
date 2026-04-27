// Client untuk mengakses API BPS langsung (tanpa Python)
const BPS_API_BASE = "https://webapi.bps.go.id/v1";
const BPS_API_TOKEN = process.env.BPS_API_KEY; // Simpan di .env.local
const DOMAIN_CODE = "1507"; // Kode Tanjung Jabung Barat

export async function fetchBPSData(query: string) {
  try {
    // Cari publikasi terbaru
    const pubResponse = await fetch(
      `${BPS_API_BASE}/list/publication?domain=${DOMAIN_CODE}&lang=ind`,
      {
        headers: {
          'Authorization': `Bearer ${BPS_API_TOKEN}`
        }
      }
    );
    
    const publications = await pubResponse.json();
    
    // Filter berdasarkan query
    const relevant = publications.data?.filter((pub: any) => {
      const title = pub.title.toLowerCase();
      const queryLower = query.toLowerCase();
      
      return title.includes(queryLower) || 
             queryLower.includes('data') ||
             (queryLower.includes('penduduk') && title.includes('penduduk'));
    }) || [];
    
    return {
      sources: relevant.slice(0, 3).map((pub: any) => ({
        uri: pub.url || `https://tanjabbarkab.bps.go.id/publication/${pub.id}`,
        title: pub.title
      })),
      data: relevant
    };
    
  } catch (error) {
    console.error("BPS API error:", error);
    return { sources: [], data: [] };
  }
}