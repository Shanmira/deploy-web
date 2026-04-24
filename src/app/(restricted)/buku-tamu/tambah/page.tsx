"use client";
import { getUserByEmail, addGuest } from "@/app/action";
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
import { ORGANIZATIONS } from "@/data/layanan";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react"; // Import icon untuk animasi sukses

const TambahTamu = () => {
  const { data: session } = useSession();
  const [organization, setOrganization] = useState("");
  const router = useRouter();
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(new Date());
  const [organizationOptions, setOrganizationOptions] = useState<
    { value: string; label: string }[]
  >(ORGANIZATIONS.map((o) => ({ value: o.name, label: o.name })));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false); // State untuk animasi sukses

  useEffect(() => {
    if (session && session.user) {
      console.log(session);
      getUserByEmail(session.user.email!).then((res) => {
        if (res.length === 0) return;
        setOrganization(res[0].organization);
        setOrganizationOptions((prev) => [
          ...prev,
          { value: res[0].organization, label: res[0].organization },
        ]);
      });
    }
  }, [session]);

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (purpose === "" || organization === "" || phone === "") {
      setErrorMessage("Tujuan kedatangan, organisasi, dan nomor telepon harus terisi");
      return;
    }
    if (session && session.user) {
      setLoading(true);
      setErrorMessage("");

      const success = await addGuest({
        email: session.user.email!,
        organization: organization,
        visitedAt: date,
        purpose: purpose,
        phone,
      });

      if (success) {
        // Tampilkan animasi sukses
        setShowSuccessAnimation(true);
        
        toast({
          title: "Buku tamu berhasil ditambahkan",
          description: new Date(date).toLocaleDateString("id-ID"),
        });
        
        // Jeda 3 detik sebelum redirect
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setLoading(false);
          router.push("/");
        }, 3000); // 3000 ms = 3 detik
        
      } else {
        toast({
          title: "Buku tamu gagal ditambahkan",
          description: new Date(date).toLocaleDateString("id-ID"),
        });
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4 w-full my-8">
      <div className="m-auto w-11/12 md:w-2/3 lg:w-1/2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            Buku Tamu
          </CardTitle>
          <p className="text-start text-sm text-red-600">{errorMessage}</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <InputText
            label="Nama"
            name="name"
            value={session?.user?.name ? session.user.name : ""}
            required={true}
            disabled={true}
          />
          <InputText
            label="Email"
            name="email"
            disabled={true}
            required={true}
            value={session?.user?.email ? session.user.email : ""}
          />
          <InputText
            label="Nomor Telepon"
            name="phone"
            type="tel"
            required={true}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading || showSuccessAnimation} // Disable saat loading atau animasi
          />
          <ComboboxWithLabel
            options={organizationOptions}
            label="Pilih Organisasi"
            name="organisasi"
            value={organization}
            onChange={setOrganization}
            disabled={loading || showSuccessAnimation} // Disable saat loading atau animasi
          />
          <DatePickerWithLable
            label="Tanggal Kedatangan"
            value={date}
            onChange={setDate}
            required={true}
            disabled={loading || showSuccessAnimation} // Disable saat loading atau animasi
          />
          <InputTextArea
            label="Tujuan Kedatangan"
            name="purpose"
            required={true}
            value={purpose}
            placeholder="e.g Permintaan data rumah tangga perikanan"
            onChange={(e) => setPurpose(e.target.value)}
            disabled={loading || showSuccessAnimation} // Disable saat loading atau animasi
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full md:w-1/3 flex gap-2 justify-center ease-in-out"
            onClick={(e) => {
              onSubmit(e);
            }}
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

      {/* Overlay animasi sukses full screen (opsional) */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl animate-scale-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Berhasil!</h3>
            <p className="text-gray-600 text-center">
              Buku tamu berhasil ditambahkan
              <br />
              Mengalihkan ke halaman utama...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-green-500 h-2 rounded-full animate-progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-up {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes progress-bar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
        
        .animate-progress-bar {
          animation: progress-bar 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default TambahTamu;