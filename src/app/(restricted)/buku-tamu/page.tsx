"use client";
import React, { useEffect, useState } from "react";
import { DatePicker } from "@/components/datepicker";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { GuestTable } from "@/components/table";
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

import { GUEST } from "@/types/types";
import { InputText, InputTextArea } from "@/components/input";
import { deleteGuest, getGuests, updateGuest } from "@/app/action";
import { toast } from "@/hooks/use-toast";
import Spinner from "@/components/ui/loading";
import { Download, Plus } from "lucide-react";
import { exportToExcel } from "@/lib/utils";

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
const EditGuestForm = ({ guest }: { guest: GUEST }) => {
  const [purpose, setPurpose] = useState(guest.purpose);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    if (purpose === "") {
      setErrorMessage("Tujuan kedatangan harus terisi");
      setLoading(false);
      return;
    }
    const payload = {
      id: guest.id,
      purpose: purpose,
    };
    const success = await updateGuest(payload);
    if (success) {
      toast({
        title: "Buku tamu berhasil diupdate",
        description: new Date(guest.visitedAt).toLocaleDateString("id-ID"),
      });
      setErrorMessage("");
    } else {
      toast({
        title: "Buku tamu gagal diupdate",
        description: new Date(guest.visitedAt).toLocaleDateString("id-ID"),
      });
    }
    setLoading(false);
  };
  return (
    <div className="space-y-4 md:space-y-6 ">
      <p className="text-red-500 text-xs md:text-sm">{errorMessage}</p>
      <InputText
        label={"Email"}
        name={"email"}
        value={guest.guestEmail}
        disabled={true}
      />
      <InputTextArea
        label={"Tujuan Kedatangan"}
        name={"purpose"}
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      />
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
  const [selectedGuest, setSelectedGuest] = useState<GUEST | null>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [guests, setGuests] = useState<GUEST[] | null>(null);
  const [range, setRange] = useState<DateRange>({ from: undefined, to: undefined });

  const onAddGuestClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    if (router) {
      router.push("/buku-tamu/tambah");
    }
    setLoading(false);
  };

  const dialogCallback = (guest: GUEST, dialogTriggerState: boolean) => {
    setSelectedGuest(guest);
    setDialogOpen(dialogTriggerState);
  };
  const alertDialogCallback = (
    guest: GUEST,
    alertDialogTriggerState: boolean
  ) => {
    setSelectedGuest(guest);
    setAlertDialogOpen(alertDialogTriggerState);
  };
  const onDeleteHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!selectedGuest) return;
    const success = await deleteGuest({ id: selectedGuest.id });
    if (success) {
      toast({
        title: "Data tamu berhasil dihapus",
        // description: new Date(guest.visitedAt).toLocaleDateString("id-ID"),
      });
      // setErrorMessage("");
    } else {
      toast({
        title: "Data tamu gagal dihapus",
        // description: new Date(guest.visitedAt).toLocaleDateString("id-ID"),
      });
    }
    setLoading(false);
    setAlertDialogOpen(false);
    router.push("/buku-tamu");
  };
  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      const temp = await getGuests();
      setLoading(false);
      setGuests(temp.map((guest) => guest.guests));
      console.log(temp);
    };
    fetchGuests();
  }, []);

  const onExportDataClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!guests || guests?.length === 0) return;
    exportToExcel(
      remapData(guests, range.from?.toISOString(), range.to?.toISOString()),
      "daftar-tamu"
    );
  };

  const remapData = (
    guests: GUEST[],
    startDate?: string,
    endDate?: string
  ) => {
    const filtered = guests.filter((p => {
      if (!startDate && !endDate) return true;

      const [y, m, d] = p.visitedAt.split("-").map(Number);
      const eventDate = new Date(y, m -1, d);

      const start = startDate ? new Date(startDate): null;
      const end = endDate ? new Date(endDate) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      if (start && end ) return eventDate >= start && eventDate <= end;
      if (start) return eventDate >= start;
      if (end) return eventDate <= end;

      return true;
    }))
    
    return filtered.map((guest) => {
      const temp: { [key: string]: string } = {};
      temp["email"] = guest.guestEmail;
      temp["tujuan"] = guest.purpose;
      temp["tanggal_kunjungan"] = guest.visitedAt;
      return temp;
    });
  };

  return (
    <div className="w-11/12 md:w-8/12 m-auto my-8 space-y-4 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-primary text-lg md:text-2xl font-medium">
          Daftar Tamu PST{" "}
        </h1>
        <h2 className="text-sm md:text-lg">
          BPS Kabupaten Tanjung Jabung Barat
        </h2>
      </div>
      <div className="w-full flex md:justify-end items-end gap-2">
        <DatePicker mode="range" value={range} callback={setRange} />
        {/* <Button
          onClick={onAddGuestClick}
          className="flex items-center gap-2"
          size="sm"
        >
          {loading ? <Spinner /> : <Plus size={14} />} Tambah Tamu
        </Button> */}
        <Button
          size="sm"
          onClick={onExportDataClick}
          className="flex items-center gap-2 bg-emerald-500"
          disabled={loading || guests?.length === 0}
        >
          {loading ? <Spinner /> : <Download size={14} />}Export Data
        </Button>
      </div>
      <DialogGeneric
        title={"Update Tamu"}
        open={dialogOpen}
        setOpen={setDialogOpen}
        content={<EditGuestForm guest={selectedGuest as GUEST} />}
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
                &quot;{selectedGuest?.purpose}&quot; oleh{" "}
                <strong>{selectedGuest?.guestEmail}</strong>
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
        <GuestTable
          dialogCallback={dialogCallback}
          alertDialogCallback={alertDialogCallback}
          startDate={range.from?.toISOString()}
          endDate={range.to?.toISOString()}
        />
      </div>
    </div>
  );
};

export default Page;
