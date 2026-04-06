"use client";

import dynamic from "next/dynamic";
const BukuTamuIllustration = dynamic(() => import("@/components/lotties/hero").then((obj) => obj.BukuTamuIllustration), {
  ssr: false,
});
const PermintaanDataIllustration = dynamic(() => import("@/components/lotties/hero").then((obj) => obj.PermintaanDataIllustration), {
  ssr: false,
});
const SiitungIllustration = dynamic(() => import("@/components/lotties/hero").then((obj) => obj.SiitungIllustration), {
  ssr: false,
});
const DataIllustration = dynamic(() => import("@/components/lotties/hero").then((obj) => obj.DataIllustration), { ssr: false });

const PengaduanIllustration = dynamic(() => import("@/components/lotties/hero").then((obj) => obj.PengaduanIllustration), {
  ssr: false,
});

const StatalkIllustration = dynamic(() => import("@/components/lotties/hero").then((obj) => obj.StatalkIllustration), {
  ssr: false,
});

export const ORGANIZATIONS = [
  {
    name: "Badan Pusat Statistik Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Perikanan dan Kelautan Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Pendidikan Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Perdagangan Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Perhubungan Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Pertanian Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Tenaga Kerja Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Lingkungan Hidup Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  {
    name: "Dinas Kesehatan Kabupaten Tanjung Jabung Barat",
    kind: "Pemerintahan",
  },
  { name: "SMA Negeri 1 Tanjung Jabung Barat", kind: "Sekolah" },
  { name: "SMK Negeri 1 Tanjung Jabung Barat", kind: "Sekolah" },
  { name: "SMK Negeri 2 Tanjung Jabung Barat", kind: "Sekolah" },
  { name: "SMK Negeri 3 Tanjung Jabung Barat", kind: "Sekolah" },
  { name: "SMK Negeri 4 Tanjung Jabung Barat", kind: "Sekolah" },
  { name: "IAIN Tanjung Jabung Barat", kind: "Sekolah" },
  { name: "STAI Tanjung Jabung Barat", kind: "Sekolah" },
];

export const JENIS_PENGADUAN = ["Layanan Perpustakaan", "Layanan Rekomendasi Statistik", "Layanan Konsultasi Statistik", "Layanan Pembinaan Statistik", "Layanan Teknologi Informasi", "Lainnya"];

export const LAYANANS: {
  title: string;
  href: string;
  description: string;
  icon: React.JSX.Element;
}[] = [
  {
    title: "Buku Tamu",
    href: "/buku-tamu",
    description: "Daftar Tamu BPS Kabupaten Tanjung Jabung Barat",
    icon: <BukuTamuIllustration />,
  },
  {
    title: "Permintaan Data",
    href: "https://silastik.bps.go.id/v3/index.php/site/login/",
    description: "Buat permintaan data statistik dan Pantau progres eksekusi permintaan data anda di sini",
    icon: <PermintaanDataIllustration />,
  },
  {
    title: "StaTalk",
    href: "https://wa.me/6285714272305",
    description: "Layanan chat menggunakan whatsapp",
    icon: <StatalkIllustration />,
  },
  {
    title: "PRISMA",
    href: "https://prisma.bpsjambi.id/indicator/1507",
    description: "Platform Indikator Statistik Wilayah Jambi Kabupaten Tanjung Jabung Barat",
    icon: <SiitungIllustration />,
  },
  {
    title: "Pengaduan & Whistleblowing System",
    href: "/pengaduan?mode=pengaduan",
    description: "Adukan keluhan terhadap layanan kami atau pelanggaran yang anggota kami lakukan",
    icon: <PengaduanIllustration />,
  },
  {
    title: "Survei Kebutuhan Data 2026",
    href: "https://skd.bps.go.id/skd/p/1507",
    description: "Bantu kami menjadi lebih baik dengan mengisi Survei Kebutuhan Data",
    icon: <DataIllustration />,
  },
];
