"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DatePicker } from "@/components/datepicker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PengaduanTable } from "@/components/table";
import { WhistleBlowingTable } from "@/components/table";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { PENGADUAN, WHISTLEBLOWING } from "@/types/types";
import {
  ComboboxWithLabel,
  DatePickerWithLable,
  InputText,
  InputTextArea,
} from "@/components/input";
import {
  deletePengaduan,
  deleteWhistleblowing,
  getPengaduan,
  getWhistleBlowing,
  getUserByEmail,
  updateWhistleBlowing,
  updatePengaduan,
} from "@/app/action";
import { toast } from "@/hooks/use-toast";
import Spinner from "@/components/ui/loading";
import { Download, Plus } from "lucide-react";
import { exportToExcel } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { PENGADUAN_OPTIONS, PELANGGARAN_OPTIONS } from "@/lib/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─────────────────────────────────────────────
// Generic Dialog & AlertDialog wrappers
// ─────────────────────────────────────────────

const DialogGeneric = ({
  title,
  trigger,
  description,
  open = false,
  setOpen = () => {},
  content,
}: {
  title: string;
  open?: boolean;
  description?: string;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  content: React.ReactNode;
}) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {content}
      <DialogFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => { e.preventDefault(); setOpen(false); }}
        >
          Batal
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const AlertDialogGeneric = ({
  title,
  trigger,
  description,
  open = false,
  setOpen = () => {},
  content,
}: {
  title: string;
  open?: boolean;
  description?: string;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  content: React.ReactNode;
}) => (
  <AlertDialog open={open} onOpenChange={setOpen}>
    <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
    <AlertDialogContent className="sm:max-w-[425px]">
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription className="p-2 bg-amber-50 text-amber-600 text-xs md:text-sm rounded-lg">
          {description ?? "Aksi ini tidak bisa dipulihkan."}
        </AlertDialogDescription>
      </AlertDialogHeader>
      {content}
      <AlertDialogFooter>
        <AlertDialogCancel className="w-full">Batal</AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// ─────────────────────────────────────────────
// Status radio options (shared)
// ─────────────────────────────────────────────

const STATUS_OPTIONS = ["Belum Ditindaklanjut", "Sedang Ditindaklanjut", "Selesai Ditindaklanjut"];

const StatusRadioGroup = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <h2 className="text-gray-600 text-sm">Status Tindak Lanjut</h2>
    <RadioGroup defaultValue={value} onValueChange={onChange} className="space-y-2">
      {STATUS_OPTIONS.map((s, i) => (
        <div key={s} className="flex items-center space-x-2">
          <RadioGroupItem value={s} id={`r${i + 1}`} />
          <Label htmlFor={`r${i + 1}`} className="text-xs">{s}</Label>
        </div>
      ))}
    </RadioGroup>
  </div>
);

// ─────────────────────────────────────────────
// Edit Pengaduan Form
// ─────────────────────────────────────────────

const EditPengaduanForm = ({
  pengaduan,
  onSuccess,
}: {
  pengaduan: PENGADUAN;
  onSuccess: () => void;
}) => {
  const [description, setDescription] = useState(pengaduan.description);
  const [phone, setPhone] = useState(pengaduan.phone);
  const [suspect, setSuspect] = useState(pengaduan.suspect);
  const [reportedAt, setReportedAt] = useState(new Date(pengaduan.eventDate));
  const [proof, setProof] = useState(pengaduan.proof);
  const [selectedCategory, setSelectedCategory] = useState(pengaduan.category);
  const [selectedStatus, setSelectedStatus] = useState(pengaduan.status ?? "Belum Ditindaklanjut");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") router.push("/auth/login");

  const onSubmitHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!description) { setErrorMessage("Deskripsi pengaduan harus terisi"); setLoading(false); return; }
    const success = await updatePengaduan({
      id: pengaduan.id, reporter: pengaduan.reporter, phone,
      category: selectedCategory, suspect, reportedAt: reportedAt.toISOString(),
      description, proof, status: selectedStatus,
    });
    if (success) {
      toast({ title: "Pengaduan berhasil diupdate", description: new Date().toLocaleDateString("id-ID") });
      setErrorMessage(""); onSuccess();
    } else {
      toast({ title: "Pengaduan gagal diupdate", description: new Date().toLocaleDateString("id-ID") });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 h-[75vh]">
      <p className="text-red-500 text-xs md:text-sm">{errorMessage}</p>
      <div className="space-y-2 md:space-y-4 overflow-y-scroll h-[60vh]">
        <InputText label="Email" name="email" required value={session?.user?.email ?? ""} disabled />
        <InputText label="No Telp." name="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        <ComboboxWithLabel options={PENGADUAN_OPTIONS} label="Jenis Layanan" name="Jenis Layanan" value={selectedCategory} onChange={setSelectedCategory} disabled />
        <DatePickerWithLable label="Tanggal Kejadian" value={reportedAt} onChange={setReportedAt} required />
        <StatusRadioGroup value={selectedStatus} onChange={setSelectedStatus} />
        <InputText label="ASN yang terlibat" name="suspect" required value={suspect} onChange={(e) => setSuspect(e.target.value)} />
        <InputTextArea label="Deskripsi" name="purpose" required value={description} placeholder="Tuliskan laporan Saudara secara singkat" onChange={(e) => setDescription(e.target.value)} />
        <InputText label="Link bukti" name="link bukti" required value={proof} onChange={(e) => setProof(e.target.value)} />
      </div>
      <Button type="submit" className="w-full flex items-center gap-2" onClick={onSubmitHandler} disabled={loading}>
        {loading && <Spinner />}Kirim
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Edit Whistleblowing Form
// ─────────────────────────────────────────────

const EditWhistleblowingForm = ({
  whistleblowing,
  onSuccess,
}: {
  whistleblowing: WHISTLEBLOWING;
  onSuccess: () => void;
}) => {
  const [description, setDescription] = useState(whistleblowing.description);
  const [phone, setPhone] = useState(whistleblowing.phone);
  const [suspect, setSuspect] = useState(whistleblowing.suspect);
  const [reportedAt, setReportedAt] = useState(new Date(whistleblowing.eventDate));
  const [proof, setProof] = useState(whistleblowing.proof);
  const [selectedCategory, setSelectedCategory] = useState(whistleblowing.category);
  const [selectedStatus, setSelectedStatus] = useState(whistleblowing.status ?? "Belum Ditindaklanjut");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") router.push("/auth/login");

  const onSubmitHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!description) { setErrorMessage("Deskripsi whistleblowing harus terisi"); setLoading(false); return; }
    const success = await updateWhistleBlowing({
      id: whistleblowing.id, reporter: whistleblowing.reporter, phone,
      category: selectedCategory, suspect, reportedAt: reportedAt.toISOString(),
      description, proof, status: selectedStatus,
    });
    if (success) {
      toast({ title: "Whistleblowing berhasil diupdate", description: new Date().toLocaleDateString("id-ID") });
      setErrorMessage(""); onSuccess();
    } else {
      toast({ title: "Whistleblowing gagal diupdate", description: new Date().toLocaleDateString("id-ID") });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 h-[75vh]">
      <p className="text-red-500 text-xs md:text-sm">{errorMessage}</p>
      <div className="space-y-2 md:space-y-4 overflow-y-scroll h-[60vh]">
        <InputText label="Email" name="email" required value={session?.user?.email ?? ""} disabled />
        <InputText label="No Telp." name="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        <ComboboxWithLabel options={PELANGGARAN_OPTIONS} label="Jenis Pelanggaran" name="Jenis Pelanggaran" value={selectedCategory} onChange={setSelectedCategory} disabled />
        <DatePickerWithLable label="Tanggal Kejadian" value={reportedAt} onChange={setReportedAt} required />
        <StatusRadioGroup value={selectedStatus} onChange={setSelectedStatus} />
        <InputText label="ASN yang terlibat" name="suspect" required value={suspect} onChange={(e) => setSuspect(e.target.value)} />
        <InputTextArea label="Deskripsi" name="purpose" required value={description} placeholder="Tuliskan laporan Saudara secara singkat" onChange={(e) => setDescription(e.target.value)} />
        <InputText label="Link bukti" name="link bukti" required value={proof} onChange={(e) => setProof(e.target.value)} />
      </div>
      <Button type="submit" className="w-full flex items-center gap-2" onClick={onSubmitHandler} disabled={loading}>
        {loading && <Spinner />}Kirim
      </Button>
    </div>
  );
};

// ─────────────────────────────────────────────
// Shared Filter Toolbar
// ─────────────────────────────────────────────

const FilterToolbar = ({
  showAddButton, onAddClick, addLabel, loading,
  range, setRange, filterStatus, setFilterStatus,
  showExport, onExportClick, exportDisabled,
}: {
  showAddButton: boolean;
  onAddClick: () => void;
  addLabel: string;
  loading: boolean;
  range: DateRange;
  setRange: (r: DateRange) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  showExport: boolean;
  onExportClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  exportDisabled: boolean;
}) => (
  <div className="w-full flex flex-wrap md:justify-end items-end gap-2 mb-4">
    {showAddButton && (
      <Button size="sm" onClick={onAddClick} className="flex items-center gap-2" disabled={loading}>
        <Plus size={14} />{addLabel}
      </Button>
    )}
    <DatePicker mode="range" value={range} callback={setRange} />
    <Select value={filterStatus} onValueChange={setFilterStatus}>
      <SelectTrigger className="w-[200px] h-9 text-xs md:text-sm">
        <SelectValue placeholder="Filter Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-xs md:text-sm">Semua Status</SelectItem>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s} className="text-xs md:text-sm">{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {showExport && (
      <Button size="sm" onClick={onExportClick} className="flex items-center gap-2 bg-emerald-500" disabled={exportDisabled}>
        {loading ? <Spinner /> : <Download size={14} />}Export Data
      </Button>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────

const Page = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { data: session, status: sessionStatus } = useSession();

  // ── Auth & role ──
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const isAdminOrOperator = userRole === "admin" || userRole === "operator";

  // ── Loading ──
  const [loading, setLoading] = useState(false);

  // ── Pengaduan state ──
  const [pengaduans, setPengaduans] = useState<PENGADUAN[] | null>(null);
  const [selectedPengaduan, setSelectedPengaduan] = useState<PENGADUAN | null>(null);
  const [dialogPengaduanOpen, setDialogPengaduanOpen] = useState(false);
  const [alertPengaduanOpen, setAlertPengaduanOpen] = useState(false);
  const [refreshPengaduanTrigger, setRefreshPengaduanTrigger] = useState(0);
  const [rangePengaduan, setRangePengaduan] = useState<DateRange>({ from: undefined, to: undefined });
  const [filterStatusPengaduan, setFilterStatusPengaduan] = useState("all");

  // ── Whistleblowing state ──
  const [whistleblowings, setWhistleblowings] = useState<WHISTLEBLOWING[] | null>(null);
  const [selectedWhistleblowing, setSelectedWhistleblowing] = useState<WHISTLEBLOWING | null>(null);
  const [dialogWhistleblowingOpen, setDialogWhistleblowingOpen] = useState(false);
  const [alertWhistleblowingOpen, setAlertWhistleblowingOpen] = useState(false);
  const [refreshWhistleblowingTrigger, setRefreshWhistleblowingTrigger] = useState(0);
  const [rangeWhistleblowing, setRangeWhistleblowing] = useState<DateRange>({ from: undefined, to: undefined });
  const [filterStatusWhistleblowing, setFilterStatusWhistleblowing] = useState("all");

  if (sessionStatus === "unauthenticated") router.push("/auth/login");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // ── Fetch functions ──
  const fetchPengaduan = async () => {
    setLoading(true);
    const temp = await getPengaduan();
    setPengaduans(temp.map((p) => p.pengaduan));
    setLoading(false);
  };

  const fetchWhistleblowing = async () => {
    setLoading(true);
    const temp = await getWhistleBlowing();
    setWhistleblowings(temp.map((w) => w.whistleblowing));
    setLoading(false);
  };

  useEffect(() => {
    const abortController = new AbortController();
    const initializeUser = async () => {
      if (session?.user) {
        const res = await getUserByEmail(session.user.email!);
        if (res.length > 0) {
          session.user.organization = res[0].organization;
          session.user.name = res[0].name;
          setUserRole(res[0].role ?? "user");
          setLoggedInEmail(session.user.email ?? null);
        }
      }
    };
    initializeUser();
    fetchPengaduan();
    fetchWhistleblowing();
    return () => abortController.abort();
  }, [session]);

  // ── Pengaduan handlers ──
  const dialogPengaduanCallback = (p: PENGADUAN, state: boolean) => { setSelectedPengaduan(p); setDialogPengaduanOpen(state); };
  const alertPengaduanCallback = (p: PENGADUAN, state: boolean) => { setSelectedPengaduan(p); setAlertPengaduanOpen(state); };
  const handlePengaduanEditSuccess = () => { setDialogPengaduanOpen(false); setRefreshPengaduanTrigger((v) => v + 1); fetchPengaduan(); };
  const handlePengaduanDeleteSuccess = () => { setAlertPengaduanOpen(false); setRefreshPengaduanTrigger((v) => v + 1); fetchPengaduan(); };
  const onDeletePengaduanHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedPengaduan) return;
    setLoading(true);
    const success = await deletePengaduan({ id: selectedPengaduan.id });
    if (success) { toast({ title: "Data pengaduan berhasil dihapus" }); handlePengaduanDeleteSuccess(); }
    else { toast({ title: "Data pengaduan gagal dihapus" }); setAlertPengaduanOpen(false); }
    setLoading(false);
  };

  // ── Whistleblowing handlers ──
  const dialogWhistleblowingCallback = (w: WHISTLEBLOWING, state: boolean) => { setSelectedWhistleblowing(w); setDialogWhistleblowingOpen(state); };
  const alertWhistleblowingCallback = (w: WHISTLEBLOWING, state: boolean) => { setSelectedWhistleblowing(w); setAlertWhistleblowingOpen(state); };
  const handleWhistleblowingEditSuccess = () => { setDialogWhistleblowingOpen(false); setRefreshWhistleblowingTrigger((v) => v + 1); fetchWhistleblowing(); };
  const handleWhistleblowingDeleteSuccess = () => { setAlertWhistleblowingOpen(false); setRefreshWhistleblowingTrigger((v) => v + 1); fetchWhistleblowing(); };
  const onDeleteWhistleblowingHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedWhistleblowing) return;
    setLoading(true);
    const success = await deleteWhistleblowing({ id: selectedWhistleblowing.id });
    if (success) { toast({ title: "Data whistleblowing berhasil dihapus" }); handleWhistleblowingDeleteSuccess(); }
    else { toast({ title: "Data whistleblowing gagal dihapus" }); setAlertWhistleblowingOpen(false); }
    setLoading(false);
  };

  // ── Export helpers ──
  const filterByDate = <T extends { eventDate: string }>(data: T[], startDate?: string, endDate?: string): T[] =>
    data.filter((item) => {
      if (!startDate && !endDate) return true;
      const [y, m, d] = item.eventDate.split("-").map(Number);
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

  const onExportPengaduanClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!pengaduans?.length) return;
    const base = isAdminOrOperator ? pengaduans : pengaduans.filter((p) => p.reporter === loggedInEmail);
    const rows = filterByDate(base, rangePengaduan.from?.toISOString(), rangePengaduan.to?.toISOString())
      .map((p) => ({ pelapor: p.reporter, deskripsi: p.description, "tanggal laporan": p.eventDate, status: p.status ?? "Belum Eksekusi" }));
    exportToExcel(rows, "daftar-pengaduan");
  };

  const onExportWhistleblowingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!whistleblowings?.length) return;
    const base = isAdminOrOperator ? whistleblowings : whistleblowings.filter((w) => w.reporter === loggedInEmail);
    const rows = filterByDate(base, rangeWhistleblowing.from?.toISOString(), rangeWhistleblowing.to?.toISOString())
      .map((w) => ({ pelapor: w.reporter, deskripsi: w.description, "tanggal laporan": w.eventDate, status: w.status ?? "Belum Eksekusi" }));
    exportToExcel(rows, "daftar-whistleblowing");
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="w-11/12 md:w-8/12 m-auto my-8 space-y-4 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-primary text-lg md:text-2xl font-medium">
          Layanan Pengaduan dan Whistleblowing
        </h1>
        <p className="text-xs md:text-sm w-full ">
          Masukkan saran dan/atau keluhan anda terhadap layanan kami atau laporkan tindakan ilegal yang dilakukan oleh anggota kami
        </p>
      </div>

      <Tabs
        defaultValue={mode === "whistleblowing" ? "whistleblowing" : "pengaduan"}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="pengaduan" onClick={() => router.push(pathname + "?" + createQueryString("mode", "pengaduan"))}>
            Pengaduan
          </TabsTrigger>
          <TabsTrigger value="whistleblowing" onClick={() => router.push(pathname + "?" + createQueryString("mode", "whistleblowing"))}>
            Whistleblowing
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════
            TAB PENGADUAN
        ══════════════════════════════════════ */}
        <TabsContent value="pengaduan" className="w-full">
          <FilterToolbar
            showAddButton={!isAdminOrOperator}
            onAddClick={() => router.push("/pengaduan/tambah")}
            addLabel="Tambah Pengaduan"
            loading={loading}
            range={rangePengaduan}
            setRange={setRangePengaduan}
            filterStatus={filterStatusPengaduan}
            setFilterStatus={setFilterStatusPengaduan}
            showExport={isAdminOrOperator}
            onExportClick={onExportPengaduanClick}
            exportDisabled={loading || !pengaduans?.length}
          />

          <DialogGeneric
            title="Update Pengaduan"
            open={dialogPengaduanOpen}
            setOpen={setDialogPengaduanOpen}
            content={
              selectedPengaduan && (
                <EditPengaduanForm pengaduan={selectedPengaduan} onSuccess={handlePengaduanEditSuccess} />
              )
            }
          />

          <AlertDialogGeneric
            title="Hapus Data Pengaduan"
            open={alertPengaduanOpen}
            setOpen={setAlertPengaduanOpen}
            content={
              <div className="space-y-6 text-xs md:text-sm text-center md:text-start">
                <div className="space-y-2">
                  <p>Apakah anda yakin ingin menghapus data ini?</p>
                  <p>&quot;{selectedPengaduan?.category}&quot; oleh <strong>{selectedPengaduan?.reporter}</strong></p>
                </div>
                <Button variant="destructive" className="w-full" onClick={onDeletePengaduanHandler} disabled={loading}>
                  {loading && <Spinner />}Hapus
                </Button>
              </div>
            }
          />

          <div className="w-full overflow-x-scroll">
            <PengaduanTable
              key={refreshPengaduanTrigger}
              dialogCallback={dialogPengaduanCallback}
              alertDialogCallback={alertPengaduanCallback}
              startDate={rangePengaduan.from?.toISOString()}
              endDate={rangePengaduan.to?.toISOString()}
              filterByReporter={!isAdminOrOperator ? loggedInEmail ?? undefined : undefined}
              filterStatus={filterStatusPengaduan === "all" ? undefined : filterStatusPengaduan}
            />
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════
            TAB WHISTLEBLOWING
        ══════════════════════════════════════ */}
        <TabsContent value="whistleblowing" className="w-full">
          <FilterToolbar
            showAddButton={!isAdminOrOperator}
            onAddClick={() => router.push("/pengaduan/whistleblowing")}
            addLabel="Tambah Pelanggaran"
            loading={loading}
            range={rangeWhistleblowing}
            setRange={setRangeWhistleblowing}
            filterStatus={filterStatusWhistleblowing}
            setFilterStatus={setFilterStatusWhistleblowing}
            showExport={isAdminOrOperator}
            onExportClick={onExportWhistleblowingClick}
            exportDisabled={loading || !whistleblowings?.length}
          />

          <DialogGeneric
            title="Update Whistleblowing"
            open={dialogWhistleblowingOpen}
            setOpen={setDialogWhistleblowingOpen}
            content={
              selectedWhistleblowing && (
                <EditWhistleblowingForm whistleblowing={selectedWhistleblowing} onSuccess={handleWhistleblowingEditSuccess} />
              )
            }
          />

          <AlertDialogGeneric
            title="Hapus Data Whistleblowing"
            open={alertWhistleblowingOpen}
            setOpen={setAlertWhistleblowingOpen}
            content={
              <div className="space-y-6 text-xs md:text-sm text-center md:text-start">
                <div className="space-y-2">
                  <p>Apakah anda yakin ingin menghapus data ini?</p>
                  <p>&quot;{selectedWhistleblowing?.category}&quot; oleh <strong>{selectedWhistleblowing?.reporter}</strong></p>
                </div>
                <Button variant="destructive" className="w-full" onClick={onDeleteWhistleblowingHandler} disabled={loading}>
                  {loading && <Spinner />}Hapus
                </Button>
              </div>
            }
          />

          <div className="w-full overflow-x-scroll">
            <WhistleBlowingTable
              key={refreshWhistleblowingTrigger}
              dialogCallback={dialogWhistleblowingCallback}
              alertDialogCallback={alertWhistleblowingCallback}
              startDate={rangeWhistleblowing.from?.toISOString()}
              endDate={rangeWhistleblowing.to?.toISOString()}
              filterByReporter={!isAdminOrOperator ? loggedInEmail ?? undefined : undefined}
              filterStatus={filterStatusWhistleblowing === "all" ? undefined : filterStatusWhistleblowing}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
