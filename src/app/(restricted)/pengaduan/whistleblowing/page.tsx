"use client";
import { addWhistleblowing } from "@/app/action";
import {
  InputText,
  ComboboxWithLabel,
  DatePickerWithLable,
  InputTextArea,
} from "@/components/input";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Spinner from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PELANGGARAN_OPTIONS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const TambahWhistleblowing = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [selectedPelanggaran, setSelectedPelanggaran] = useState("");
  const [suspect, setSuspect] = useState("");
  const [reportedAt, setReportedAt] = useState(new Date());
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  if (!session) return <Spinner />;

  const resetInput = () => {
    setDescription("");
    setProof("");
    setSuspect("");
    setSelectedPelanggaran("");
    setPhone("");
  };

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (
      session.user.email == "" ||
      phone == "" ||
      selectedPelanggaran == "" ||
      suspect == "" ||
      !reportedAt ||
      description == "" ||
      proof == ""
    ) {
      toast({
        title: "Harap lengkapi input",
        description: "Semua field wajib diisi",
      });
      return;
    }

    if (session && session.user) {
      const data = {
        email: session.user.email!,
        phone: phone,
        category: selectedPelanggaran,
        suspect: suspect,
        reportedAt: reportedAt,
        description: description,
        proof: proof,
      };

      setLoading(true);
      const success = await addWhistleblowing(data);

      if (success) {
        setShowSuccessAnimation(true);
        resetInput();
        toast({
          title: "Whistleblowing berhasil ditambahkan",
          description: "Terima kasih atas informasi anda. Laporan anda sangat bermanfaat bagi kami",
        });

        setTimeout(() => {
          setShowSuccessAnimation(false);
          setLoading(false);
          router.push("/pengaduan?mode=whistleblowing");
        }, 3000);
      } else {
        toast({
          title: "Whistleblowing gagal ditambahkan",
          description: new Date(reportedAt).toLocaleDateString("id-ID"),
        });
        setLoading(false);
        setErrorMessage("Gagal menambahkan whistleblowing, silakan coba lagi");
      }
    }
  };

  return (
    <div className="space-y-4 w-full my-8">
      <div className="m-auto w-11/12 md:w-2/3 lg:w-1/2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            Form Whistleblowing
          </CardTitle>
          <h2 className="text-center text-lg">
            BPS Kabupaten Tanjung Jabung Barat
          </h2>
          <p className="text-start text-sm text-red-600">{errorMessage}</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
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
            disabled={loading || showSuccessAnimation}
          />
          <ComboboxWithLabel
            options={PELANGGARAN_OPTIONS}
            label="Jenis Pelanggaran"
            name="Jenis Pelanggaran"
            value={selectedPelanggaran}
            onChange={setSelectedPelanggaran}
            disabled={loading || showSuccessAnimation}
          />
          <DatePickerWithLable
            label="Tanggal Kejadian"
            value={reportedAt}
            onChange={setReportedAt}
            required={true}
            disabled={loading || showSuccessAnimation}
          />
          <InputText
            label="ASN yang terlibat"
            name="suspect"
            required={true}
            value={suspect}
            onChange={(e) => setSuspect(e.target.value)}
            disabled={loading || showSuccessAnimation}
          />
          <InputTextArea
            label="Deskripsi"
            name="purpose"
            required={true}
            value={description}
            placeholder="Tuliskan laporan Saudara secara singkat"
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || showSuccessAnimation}
          />
          <InputText
            label="Link bukti"
            name="link bukti"
            required={true}
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            disabled={loading || showSuccessAnimation}
          />
        </CardContent>

        <CardFooter>
          <Button
            className="w-full md:w-1/3 flex gap-2 justify-center ease-in-out"
            onClick={(e) => onSubmit(e)}
            disabled={loading || showSuccessAnimation}
          >
            {loading && !showSuccessAnimation && <Spinner />}
            {showSuccessAnimation ? (
              <div className="flex items-center gap-2 animate-bounce">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Berhasil! Mengalihkan...</span>
              </div>
            ) : loading ? (
              "Menyimpan..."
            ) : (
              "Submit"
            )}
          </Button>
        </CardFooter>
      </div>

      {/* Overlay animasi sukses full screen */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl animate-scale-up max-w-md mx-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Pelanggaran Terkirim!</h3>
            <p className="text-gray-600 text-center">
              Terima kasih atas laporan Anda.
              <br />
              Kami akan segera menindaklanjuti laporan Anda.
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Mengalihkan ke halaman utama...
              </span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
              <div className="bg-green-500 h-2 rounded-full animate-progress-bar"></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Akan dialihkan dalam 3 detik
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s ease-out; }
        .animate-progress-bar { animation: progress-bar 3s linear forwards; }
        .animate-bounce { animation: bounce 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default TambahWhistleblowing;
