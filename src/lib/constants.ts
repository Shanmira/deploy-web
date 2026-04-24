import { JENIS_PENGADUAN } from "@/data/layanan";
import { JENIS_PELANGGARAN } from "@/data/layanan";

export const STATUS = [
  "Belum Ditindaklanjut",
  "Sedang Ditindaklanjut",
  "Selesai Ditindaklanjut",
];

export const PENGADUAN_OPTIONS = JENIS_PENGADUAN.map((o) => ({
  value: o,
  label: o,
}));
export const PELANGGARAN_OPTIONS = JENIS_PELANGGARAN.map((o) => ({
  value: o,
  label: o,
}));

export const STATUS_OPTIONS = STATUS.map((o) => ({
  value: o,
  label: o,
}));
