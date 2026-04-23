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

      const success = await addGuest({
        email: session.user.email!,
        organization: organization,
        visitedAt: date,
        purpose: purpose,
        phone,
      });
      setTimeout(() => {
        setLoading(false);
        setErrorMessage("");
      });

      if (success) {
        toast({
          title: "Buku tamu berhasil ditambahkan",
          description: new Date(date).toLocaleDateString("id-ID"),
        });
        router.push("/buku-tamu");
      } else {
        toast({
          title: "Buku tamu berhasil gagal ditambahkan",
          description: new Date(date).toLocaleDateString("id-ID"),
        });
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
          />
          <ComboboxWithLabel
            options={organizationOptions}
            label="Pilih Organisasi"
            name="organisasi"
            value={organization}
            onChange={setOrganization}
          />
          <DatePickerWithLable
            label="Tanggal Kedatangan"
            value={date}
            onChange={setDate}
            required={true}
          />
          <InputTextArea
            label="Tujuan Kedatangan"
            name="purpose"
            required={true}
            value={purpose}
            placeholder="e.g Permintaan data rumah tangga perikanan"
            onChange={(e) => setPurpose(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full md:w-1/3 flex gap-2 justify-center ease-in-out"
            onClick={(e) => {
              onSubmit(e);
            }}
            disabled={loading}
          >
            {loading && <Spinner />}
            Submit
          </Button>
        </CardFooter>
      </div>
    </div>
  );
};

export default TambahTamu;
