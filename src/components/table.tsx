"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { getGuests, getPengaduan, getUserByEmail, getWhistleBlowing } from "@/app/action";
import Spinner from "./ui/loading";
import {
  GUEST,
  GUEST_ACTION_RES,
  PENGADUAN_ACTION_RES,
  WHISTLEBLOWING_ACTION_RES,
  USER,
} from "@/types/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { EditIcon,  TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { Settings } from "lucide-react";
import { PENGADUAN } from "@/types/types";
import { WHISTLEBLOWING } from "@/types/types";

// GuestTable component - tambahkan prop refreshTrigger
export const GuestTable = ({
  dialogCallback,
  alertDialogCallback,
  startDate,
  endDate,
  refreshTrigger, // Tambahkan prop ini
}: {
  dialogCallback?: (guest: GUEST, state: boolean) => void;
  alertDialogCallback?: (guest: GUEST, state: boolean) => void;
  startDate?: string,
  endDate?: string,
  refreshTrigger?: number, // Trigger untuk refresh data
}) => {
  const { data: session } = useSession();
  const [guests, setGuests] = useState<GUEST_ACTION_RES[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<USER | null>(null);

  // Fungsi untuk fetch data
  const fetchGuests = async () => {
    setLoading(true);
    const temp = await getGuests();
    setLoading(false);
    setGuests(temp);
  };

  // Fetch data saat komonen mount dan saat refreshTrigger berubah
  useEffect(() => {
    fetchGuests();
  }, [refreshTrigger]); // Tambahkan refreshTrigger sebagai dependency

  useEffect(() => {
    const fetchUser = async (email: string) => {
      const temp = await getUserByEmail(email);
      setUser(temp[0]);
    };
    fetchUser(session?.user?.email || "");
  }, [session]);

  const filtered = guests.filter((g) => {
    if (!startDate && !endDate) return true;

    const [y, m, d] = g.guests.visitedAt.split("-").map(Number);
    const visitedAt = new Date(y, m - 1, d);

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (start && end) return visitedAt >= start && visitedAt <= end;
    if (start) return visitedAt >= start;
    if (end) return visitedAt <= end;

    return true;
  });

  return (
    <Table>
      <TableCaption className="text-xs md:text-sm">
        Daftar Tamu PST Kabupaten Tanjung Jabung Barat.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs md:text-sm">Pelapor</TableHead>
          <TableHead className="text-xs md:text-sm">Keperluan</TableHead>
          <TableHead className="text-xs md:text-sm">No. Telepon</TableHead>
          <TableHead className="text-xs md:text-sm">Tanggal Kedatangan</TableHead>
          <TableHead className="text-xs md:text-sm">
            Aksi
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && (
          <TableRow>
            <TableCell colSpan={5}>
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            </TableCell>
          </TableRow>
        )}
        {!loading && filtered.map((guest: GUEST_ACTION_RES) => (
            <TableRow key={guest.guests.id}>
              <TableCell className="font-medium text-xs md:text-sm">
                {guest.users?.name}
              </TableCell>
              <TableCell className="text-xs md:text-sm">
                {guest.guests.purpose}
              </TableCell>
              <TableCell className="text-xs md:text-sm">
                {guest.guests.guestPhone}
              </TableCell>
              <TableCell className="text-xs md:text-sm">
                {guest.guests.visitedAt}
              </TableCell>
              <TableCell>
                <DropdownMenu modal={false}>
                  {(user?.role === "admin" || user?.role === "operator") && (
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <Settings size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                  )}

                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        if (dialogCallback) {
                          dialogCallback(guest.guests, true);
                        }
                      }}
                    >
                      <span className="flex gap-2 items-center text-gray-600">
                        <EditIcon height={16}></EditIcon>Edit
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        if (alertDialogCallback) {
                          alertDialogCallback(guest.guests, true);
                        }
                      }}
                    >
                      <span className="flex gap-2 items-center text-red-500">
                        <TrashIcon height={16}></TrashIcon>
                        Hapus
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        {!loading && filtered.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500 py-8">
              Tidak ada data tamu
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
export const PengaduanTable = ({
  dialogCallback,
  alertDialogCallback,
  startDate,
  endDate,
  filterByReporter,
  filterStatus, // undefined = tampil semua status
}: {
  dialogCallback?: (pengaduan: PENGADUAN, state: boolean) => void;
  alertDialogCallback?: (pengaduan: PENGADUAN, state: boolean) => void;
  startDate?: string;
  endDate?: string;
  filterByReporter?: string;
  filterStatus?: string;
}) => {
  const { data: session } = useSession();
  const [pengaduans, setPengaduans] = useState<PENGADUAN_ACTION_RES[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<USER | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      const temp = await getPengaduan();
      setLoading(false);
      setPengaduans(temp);
    };
    fetchGuests();
  }, []);

  useEffect(() => {
    const fetchUser = async (email: string) => {
      const temp = await getUserByEmail(email);
      setUser(temp[0]);
    };
    fetchUser(session?.user?.email || "");
  }, [session]);

  const filtered = pengaduans.filter((p) => {
    // 1. Filter berdasarkan reporter (email) — hanya untuk role "user"
    if (filterByReporter) {
      if (p.pengaduan.reporter !== filterByReporter) return false;
    }

    // 2. Filter berdasarkan status tindak lanjut — semua role
    if (filterStatus) {
      const status = p.pengaduan.status ?? "Belum Ditindaklanjut";
      if (status !== filterStatus) return false;
    }

    // 3. Filter berdasarkan rentang tanggal
    if (!startDate && !endDate) return true;

    const [y, m, d] = p.pengaduan.eventDate.split("-").map(Number);
    const eventDate = new Date(y, m - 1, d);

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (start && end) return eventDate >= start && eventDate <= end;
    if (start) return eventDate >= start;
    if (end) return eventDate <= end;

    return true;
  });

  const pengaduanStatusRender = (status: string | null) => {
    switch (status) {
      case "Belum Ditindaklanjut":
        return "md:bg-red-50 text-red-500 px-4 py-1 rounded-full";
      case "Sedang Ditindaklanjut":
        return "md:bg-amber-50 text-amber-500 px-4 py-1 rounded-full";
      case "Selesai Ditindaklanjut":
        return "md:bg-emerald-50 text-emerald-500 px-4 py-1 rounded-full";
      default:
        return "md:bg-gray-50 text-gray-500 px-4 py-1 rounded-full";
    }
  };

  return (
    <Table>
      <TableCaption className="text-xs md:text-sm">
        Daftar Aduan PST Kabupaten Tanjung Jabung Barat.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs md:text-sm">Nama</TableHead>
          <TableHead className="text-xs md:text-sm">Pengaduan</TableHead>
          <TableHead className="text-xs md:text-sm">Jenis Layanan</TableHead>
          <TableHead className="text-xs md:text-sm">Bukti</TableHead>
          <TableHead className="text-xs md:text-sm w-64">
            Status Tindaklanjut
          </TableHead>
          <TableHead className="text-xs md:text-xs">
            Tanggal Laporan
          </TableHead>
            {(user?.role === "admin" || user?.role === "operator") && (

          <TableHead className="text-xs md:text-sm">Aksi</TableHead>
            )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && (
          <TableRow>
            <TableCell>
              <Spinner />
            </TableCell>
          </TableRow>
        )}
        {!loading && filtered.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-xs md:text-sm text-gray-400 py-8"
            >
              Tidak ada data pengaduan.
            </TableCell>
          </TableRow>
        )}
        {filtered.map((pengaduan: PENGADUAN_ACTION_RES) => (
          <TableRow key={pengaduan.pengaduan.id}>
            <TableCell className="font-medium text-xs md:text-sm">
              {pengaduan.users?.name}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {pengaduan.pengaduan.description}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {pengaduan.pengaduan.category}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {pengaduan.pengaduan.proof}
            </TableCell>
            <TableCell className="text-xs w-64">
              <span
                className={pengaduanStatusRender(pengaduan.pengaduan.status)}
              >
                {pengaduan.pengaduan.status}
              </span>
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {pengaduan.pengaduan.eventDate}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              <DropdownMenu modal={false}>
                {(user?.role === "admin" || user?.role === "operator") && (
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <Settings size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                )}

                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      if (dialogCallback) {
                        dialogCallback(pengaduan.pengaduan, true);
                      }
                    }}
                  >
                    <span className="flex gap-2 items-center text-gray-600">
                      <EditIcon height={16}></EditIcon>Edit
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      if (alertDialogCallback) {
                        alertDialogCallback(pengaduan.pengaduan, true);
                      }
                    }}
                  >
                    <span className="flex gap-2 items-center text-red-500">
                      <TrashIcon height={16}></TrashIcon>
                      Hapus
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export const WhistleBlowingTable = ({
  dialogCallback,
  alertDialogCallback,
  startDate,
  endDate,
  filterByReporter,
  filterStatus, // undefined = tampil semua status
}: {
  dialogCallback?: (whislteblowing: WHISTLEBLOWING, state: boolean) => void;
  alertDialogCallback?: (whistleblowing: WHISTLEBLOWING, state: boolean) => void;
  startDate?: string;
  endDate?: string;
  filterByReporter?: string;
  filterStatus?: string;
}) => {
  const { data: session } = useSession();
  const [whistleblowings, setWhistleblowing] = useState<WHISTLEBLOWING_ACTION_RES[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<USER | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      const temp = await getWhistleBlowing();
      setLoading(false);
      setWhistleblowing(temp);
    };
    fetchGuests();
  }, []);

  useEffect(() => {
    const fetchUser = async (email: string) => {
      const temp = await getUserByEmail(email);
      setUser(temp[0]);
    };
    fetchUser(session?.user?.email || "");
  }, [session]);

  const filtered = whistleblowings.filter((p) => {
    // 1. Filter berdasarkan reporter (email) — hanya untuk role "user"
    if (filterByReporter) {
      if (p.whistleblowing.reporter !== filterByReporter) return false;
    }

    // 2. Filter berdasarkan status tindak lanjut — semua role
    if (filterStatus) {
      const status = p.whistleblowing.status ?? "Belum Ditindaklanjut";
      if (status !== filterStatus) return false;
    }

    // 3. Filter berdasarkan rentang tanggal
    if (!startDate && !endDate) return true;

    const [y, m, d] = p.whistleblowing.eventDate.split("-").map(Number);
    const eventDate = new Date(y, m - 1, d);

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (start && end) return eventDate >= start && eventDate <= end;
    if (start) return eventDate >= start;
    if (end) return eventDate <= end;

    return true;
  });

  const whistleblowingStatusRender = (status: string | null) => {
    switch (status) {
      case "Belum Ditindaklanjut":
        return "md:bg-red-50 text-red-500 px-4 py-1 rounded-full";
      case "Sedang Ditindaklanjut":
        return "md:bg-amber-50 text-amber-500 px-4 py-1 rounded-full";
      case "Selesai Ditindaklanjut":
        return "md:bg-emerald-50 text-emerald-500 px-4 py-1 rounded-full";
      default:
        return "md:bg-gray-50 text-gray-500 px-4 py-1 rounded-full";
    }
  };

  return (
    <Table>
      <TableCaption className="text-xs md:text-sm">
        Daftar Whistleblowing PST Kabupaten Tanjung Jabung Barat.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs md:text-sm">Nama</TableHead>
          <TableHead className="text-xs md:text-sm">Pelanggaran</TableHead>
          <TableHead className="text-xs md:text-sm">Jenis Pelanggaran</TableHead>
          <TableHead className="text-xs md:text-sm">Bukti</TableHead>
          <TableHead className="text-xs md:text-sm w-64">
            Status Tindaklanjut
          </TableHead>
          <TableHead className="text-xs md:text-xs">
            Tanggal Laporan
          </TableHead>
                {(user?.role === "admin" || user?.role === "operator") && (

          <TableHead className="text-xs md:text-sm">Aksi</TableHead>
                )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading && (
          <TableRow>
            <TableCell>
              <Spinner />
            </TableCell>
          </TableRow>
        )}
        {!loading && filtered.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-xs md:text-sm text-gray-400 py-8"
            >
              Tidak ada data Whistleblowing.
            </TableCell>
          </TableRow>
        )}
        {filtered.map((whistleblowing: WHISTLEBLOWING_ACTION_RES) => (
          <TableRow key={whistleblowing.whistleblowing.id}>
            <TableCell className="font-medium text-xs md:text-sm">
              {whistleblowing.users?.name}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {whistleblowing.whistleblowing.description}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {whistleblowing.whistleblowing.category}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {whistleblowing.whistleblowing.proof}
            </TableCell>
            <TableCell className="text-xs w-64">
              <span
                className={whistleblowingStatusRender(whistleblowing.whistleblowing.status)}
              >
                {whistleblowing.whistleblowing.status}
              </span>
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              {whistleblowing.whistleblowing.eventDate}
            </TableCell>
            <TableCell className="text-xs md:text-sm">
              <DropdownMenu modal={false}>
                {(user?.role === "admin" || user?.role === "operator") && (
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <Settings size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                )}

                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      if (dialogCallback) {
                        dialogCallback(whistleblowing.whistleblowing, true);
                      }
                    }}
                  >
                    <span className="flex gap-2 items-center text-gray-600">
                      <EditIcon height={16}></EditIcon>Edit
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      if (alertDialogCallback) {
                        alertDialogCallback(whistleblowing.whistleblowing, true);
                      }
                    }}
                  >
                    <span className="flex gap-2 items-center text-red-500">
                      <TrashIcon height={16}></TrashIcon>
                      Hapus
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};


export default GuestTable;
