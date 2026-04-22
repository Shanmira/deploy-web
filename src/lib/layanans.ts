import { de } from "date-fns/locale";

export type Layanan = {
	key: string;
	title: string;
	href: string;
	description: string;
};

export function buildLayanans(role?: string): Layanan[] {
	return [
		{
			key: "buku-tamu",
			title: "Buku Tamu",
			href:
				role === "admin" || role === "operator"
					? "buku-tamu"
					: "buku-tamu/tambah",
			description: "Daftar Tamu BPS Kabupaten Tanjung Jabung Barat",
		}
	]
}