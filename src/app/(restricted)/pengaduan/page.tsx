"use client";
import React, { useCallback, useEffect, useState } from "react";
import { DatePicker } from "@/components/datepicker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PengaduanTable } from "@/components/table";
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

import { PENGADUAN } from "@/types/types";
import {
  ComboboxWithLabel,
  DatePickerWithLable,
  InputText,
  InputTextArea,
} from "@/components/input";
import {
  deletePengaduan,
  getPengaduan,
  getUserByEmail,
  updatePengaduan,
} from "@/app/action";
import { toast } from "@/hooks/use-toast";
import Spinner from "@/components/ui/loading";
import { Download, Plus } from "lucide-react";
import { exportToExcel } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { PENGADUAN_OPTIONS } from "@/lib/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const DialogGeneric = ({
  title,
  trigger,
  description,
  open = false,
  setOpen = () => {},
  // submitButton,
  content,
}: {
  title: string;
  open?: boolean;
  description?: string;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  // submitButton?: React.ReactNode;
  content: React.ReactNode;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description} </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          >
            Batal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AlertDialogGeneric = ({
  title,
  trigger,
  description,
  open = false,
  setOpen = () => {},
  content,
}: // submitButton,

{
  title: string;
  open?: boolean;
  description?: string;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  trigger?: React.ReactNode;
  // submitButton?: React.ReactNode;
  content: React.ReactNode;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="p-2 bg-amber-50 text-amber-600 text-xs md:text-sm rounded-lg">
            {description ? description : "Aksi ini tidak bisa dipulihkan."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {content}
        <AlertDialogFooter>
          <AlertDialogCancel className="w-full">Batal</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
const EditPengaduanForm = ({ pengaduan }: { pengaduan: PENGADUAN }) => {
  const [description, setDescription] = useState(pengaduan.description);
  const [phone, setPhone] = useState(pengaduan.phone);
  const [suspect, setSuspect] = useState(pengaduan.suspect);
  const [reportedAt, setReportedAt] = useState(new Date(pengaduan.eventDate));
  const [proof, setProof] = useState(pengaduan.proof);
  const [selectedPengaduan, setSelectedPengaduan] = useState(
    pengaduan.category
  );
  const [selectedStatus, setSelectedStatus] = useState(
    pengaduan.status ? pengaduan.status : "Belum Dieksekusi"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const router = useRouter();

  if (status == "unauthenticated") {
    router.push("/auth/login");
  }

  const onSubmitHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    if (description === "") {
      setErrorMessage("deskripsi pengaduan harus terisi");
      setLoading(false);
      return;
    }
    const payload = {
      id: pengaduan.id,
      reporter: pengaduan.reporter,
      phone,
      category: selectedPengaduan,
      suspect,
      reportedAt: reportedAt.toISOString(),
      description,
      proof,
      status: selectedStatus,
    };
    const success = await updatePengaduan(payload);
    if (success) {
      toast({
        title: "Buku tamu berhasil diupdate",
        description: new Date().toLocaleDateString("id-ID"),
      });
      setErrorMessage("");
    } else {
      toast({
        title: "Buku tamu gagal diupdate",
        description: new Date().toLocaleDateString("id-ID"),
      });
    }
    setLoading(false);
  };
  return (
    <div className="space-y-4 md:space-y-6 h-[75vh]">
      <p className="text-red-500 text-xs md:text-sm">{errorMessage}</p>
      <div className="space-y-2 md:space-y-4 overflow-y-scroll h-[60vh]">
        <InputText
          label="Email"
          name="email"
          required={true}
          value={session?.user?.email ? session.user.email : ""}
          disabled={true}
        />
        <InputText
          label="No Telp."
          name="phone"
          required={true}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <ComboboxWithLabel
          options={PENGADUAN_OPTIONS}
          label="Jenis Layanan"
          name="Jenis Layanan"
          value={selectedPengaduan}
          onChange={setSelectedPengaduan}
          disabled={true}
        />
        <DatePickerWithLable
          label="Tanggal Kejadian"
          value={reportedAt}
          onChange={setReportedAt}
          required={true}
        />
        <div className="space-y-2">
          <h2 className="text-gray-600 text-sm">Status Tindak Lanjut</h2>
          <RadioGroup
            defaultValue="Belum Ditindaklanjut"
            onValueChange={setSelectedStatus}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Belum Ditindaklanjut" id="r1" />
              <Label htmlFor="r1" className="text-xs">
                Belum Ditindaklanjut
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sedang Ditindaklanjut" id="r2" />
              <Label htmlFor="r2" className="text-xs">
                Sedang Ditindaklanjut
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Selesai Ditindaklanjut" id="r3" />
              <Label htmlFor="r3" className="text-xs">
                Selesai Ditindaklanjut
              </Label>
            </div>
          </RadioGroup>
        </div>

        <InputText
          label="ASN yang terlibat"
          name="suspect"
          required={true}
          value={suspect}
          onChange={(e) => setSuspect(e.target.value)}
        />
        <InputTextArea
          label="Deskripsi"
          name="purpose"
          required={true}
          value={description}
          placeholder="Tuliskan laporan Saudara secara singkat"
          onChange={(e) => setDescription(e.target.value)}
        />
        <InputText
          label="Link bukti"
          name="link bukti"
          required={true}
          value={proof}
          onChange={(e) => setProof(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full flex items-center gap-2"
        onClick={onSubmitHandler}
        disabled={loading}
      >
        {loading && <Spinner />}
        Kirim
      </Button>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [selectedPengaduan, setSelectedPengaduan] =
  useState<PENGADUAN | null>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [pengaduans, setPengaduans] = useState<PENGADUAN[] | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { data: session, status: sessionStatus } = useSession();
  const [range, setRange] = useState<DateRange>({ from: undefined, to: undefined });

  // if (!session) return <Loading />;

  if (sessionStatus == "unauthenticated") {
    router.push("/auth/login");
  }

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const onAddGuestClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    if (router) {
      router.push("/pengaduan/tambah");
    }
    setLoading(false);
  };

  const dialogCallback = (
    pengaduan: PENGADUAN,
    dialogTriggerState: boolean
  ) => {
    setSelectedPengaduan(pengaduan);
    setDialogOpen(dialogTriggerState);
  };
  const alertDialogCallback = (
    pengaduan: PENGADUAN,
    alertDialogTriggerState: boolean
  ) => {
    setSelectedPengaduan(pengaduan);
    setAlertDialogOpen(alertDialogTriggerState);
  };
  const onDeleteHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!selectedPengaduan) return;
    const success = await deletePengaduan({ id: selectedPengaduan.id });
    if (success) {
      toast({
        title: "Data pengaduan berhasil dihapus",
        // description: new Date(guest.visitedAt).toLocaleDateString("id-ID"),
      });
      // setErrorMessage("");
    } else {
      toast({
        title: "Data pengaduan gagal dihapus",
        // description: new Date(guest.visitedAt).toLocaleDateString("id-ID"),
      });
    }
    setLoading(false);
    setAlertDialogOpen(false);
    router.push("/pengaduan");
  };
  useEffect(() => {
    const abortController = new AbortController();
    const fetchPengaduan = async () => {
      setLoading(true);
      const temp = await getPengaduan();
      setLoading(false);
      setPengaduans(temp.map((p) => p.pengaduan));
      setLoading(false);
    };
    if (session && session.user) {
      getUserByEmail(session.user.email!).then((res) => {
        if (res.length > 0) {
          if (res[0].role !== "admin" && res[0].role !== "operator") {
            return router.push("/pengaduan/tambah");
          }
          if (session.user) {
            session.user.organization = res[0].organization;
            session.user.name = res[0].name;
          }
        } else {
          return;
        }
      });
    }
    fetchPengaduan();
    return () => {
      abortController.abort();
    };
  }, []);

  const onExportDataClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!pengaduans || pengaduans?.length === 0) return;
    exportToExcel(
      remapData(pengaduans, range.from?.toISOString(), range.to?.toISOString()),
    "daftar-tamu"
    );
  };

  const remapData = (
    pengaduans: PENGADUAN[],
    startDate?: string,
    endDate?: string
  ) => {
    const filtered = pengaduans.filter((p) => {
    if (!startDate && !endDate) return true;

    const [y, m, d] = p.eventDate.split("-").map(Number);
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

    return filtered.map((pengaduan) => {
      const temp: { [key: string]: string } = {};
      temp["pelapor"] = pengaduan.reporter;
      temp["deskripsi"] = pengaduan.description;
      temp["tanggal laporan"] = pengaduan.eventDate;
      temp["status"] = pengaduan.status || "Belum Eksekusi";
      return temp;
    });
  };

  return (
    <div className="w-11/12 md:w-8/12 m-auto my-8 space-y-4 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-primary text-lg md:text-2xl font-medium">
          Layanan Pengaduan dan Whistleblowing
        </h1>
        {/* <h2 className="text-sm md:text-lg">
          BPS Kabupaten Tanjung Jabung Barat
        </h2> */}
        <p className="text-xs md:text-sm w-full md:w-1/2">
          Masukkan saran dan/atau keluhan anda terhadap layanana kami atau
          laporkan tindakan ilegal yang dilakukan oleh anggota kami
        </p>
      </div>
      <Tabs
        defaultValue={mode === "pengaduan" ? "pengaduan" : "whistleblowing"}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger
            value="pengaduan"
            className="w-full"
            onClick={() =>
              router.push(
                pathname + "?" + createQueryString("mode", "pengaduan")
              )
            }
          >
            Pengaduan
          </TabsTrigger>
          <TabsTrigger
            value="whistleblowing"
            className="w-full"
            onClick={() => {
              router.push(
                pathname + "?" + createQueryString("mode", "whistleblowing")
              );
            }}
          >
            Whistleblowing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pengaduan" className="w-full">
          <div className="w-full flex md:justify-end items-end gap-2">
            <DatePicker
              mode="range"
              value={range}
              callback={setRange}
            />

            {/* <Button
              onClick={onAddGuestClick}
              className="flex items-center gap-2"
              size="sm"
            >
              {loading ? <Spinner /> : <Plus size={14} />} Tambah Pengaduan
            </Button> */}
            <Button
              size="sm"
              onClick={onExportDataClick}
              className="flex items-center gap-2 bg-emerald-500"
              disabled={loading || pengaduans?.length === 0}
            >
              {loading ? <Spinner /> : <Download size={14} />}Export Data
            </Button>
          </div>
          <DialogGeneric
            title={"Update Tamu"}
            open={dialogOpen}
            setOpen={setDialogOpen}
            content={
              <EditPengaduanForm pengaduan={selectedPengaduan as PENGADUAN} />
            }
          />
          <AlertDialogGeneric
            title={"Hapus Data"}
            // trigger={<span>Buka</span>}
            open={alertDialogOpen}
            setOpen={setAlertDialogOpen}
            content={
              <div className="space-y-6 text-xs md:text-sm text-center md:text-start">
                <div className="space-y-2">
                  <p>Apakah anda yakin ingin menghapus data ini?</p>
                  <p>
                    &quot;{selectedPengaduan?.category}&quot; oleh{" "}
                    <strong>{selectedPengaduan?.reporter}</strong>
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={onDeleteHandler}
                >
                  {loading && <Spinner />}
                  Hapus
                </Button>
              </div>
            }
          />
          <div className="w-full overflow-x-scroll">
            <PengaduanTable
              dialogCallback={dialogCallback}
              alertDialogCallback={alertDialogCallback}
              startDate={range.from?.toISOString()}  // ✅ add
              endDate={range.to?.toISOString()}  
            />
          </div>
        </TabsContent>
        <TabsContent value="whistleblowing">tes</TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
