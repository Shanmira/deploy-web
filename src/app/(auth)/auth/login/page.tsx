"use client";
import { signIn, useSession } from "next-auth/react";
import { GoogleLogo } from "@/components/logo";
import { redirect, useSearchParams } from "next/navigation";
import { decrypt } from "@/lib/encryption";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

type LoginIllustrationProps = {
  lottieWidth?: number
}

const LoginIllustration = ({ lottieWidth = 200 }: LoginIllustrationProps) => {
  return (
    <div style={{ width: lottieWidth }}>
      {/* isi lottie */}
    </div>
  )
}

export default function Login() {
  const { status } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState<string>("/");
  const searchParams = useSearchParams();
  const state = searchParams.get("state");

  useEffect(() => {
    if (state) {
      try {
        const decrypted = decrypt(state);
        const { message, redirect_url: callback_url } = JSON.parse(decrypted);
        if (message && status === "unauthenticated") {
          setMessage(message);
        }
        if (callback_url) {
          setCallbackUrl(callback_url);
        }
      } catch (e) {
        console.log(e);
        redirect("/auth/login");
      }
    }
  }, [state]);

  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row w-full">

      {/* PANEL KIRI — Judul (hanya tampil di md ke atas) */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col items-center justify-center gap-4 p-8 bg-sky-50 border-r border-gray-100">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-sky-800 text-center leading-snug">
          Pelayanan Statistik Terpadu
        </h1>
        <p className="text-sm md:text-lg text-gray-500 text-center">
          BPS Kabupaten Tanjung Jabung Barat
        </p>
      </div>

      {/* PANEL KANAN — Form Login */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center gap-6 px-6 py-10 md:p-12">

        {/* Ilustrasi */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
          <LoginIllustration lottieWidth={250} />
        </div>

        {/* Judul mobile — hanya tampil di bawah md */}
        <div className="flex flex-col items-center gap-1 md:hidden text-center">
          <h2 className="text-lg font-semibold text-sky-800">
            Pelayanan Statistik Terpadu
          </h2>
          <p className="text-xs text-gray-500">
            BPS Kabupaten Tanjung Jabung Barat
          </p>
        </div>

        <h1 className="font-semibold text-xl sm:text-2xl text-gray-800">
          Sign In
        </h1>

        {/* Form area */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-stretch gap-4">

          {/* Pesan error */}
          {message && (
            <div className="bg-red-50 px-4 py-2 text-red-500 rounded-lg text-sm text-center w-full">
              {message}
            </div>
          )}

          {/* Tombol Google */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 flex items-center justify-center gap-3 w-full hover:bg-gray-50 transition-colors duration-200 shadow-sm text-sm sm:text-base"
          >
            <GoogleLogo />
            Masuk dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}