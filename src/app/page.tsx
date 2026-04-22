"use client";
import React from "react";
import { HandHeartIcon } from "lucide-react";
import Link from "next/link";
import Menu from "@/data/layanan";
import dynamic from "next/dynamic";

const HeroIllustration = dynamic(
  () => import("@/components/lotties/hero").then((obj) => obj.HeroIllustration),
  { ssr: false }
);

export default function Page() {
  return (
    <div className="w-11/12 md:w-10/12 mx-auto my-8 space-y-16">

      {/* HERO SECTION */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 text-center md:text-left">

        {/* Teks & Tombol */}
        <div className="w-full md:w-1/2 space-y-6 flex flex-col items-center md:items-start">
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base md:text-lg text-gray-500">
              Selamat datang di
            </h2>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug text-blue-950">
              Pelayanan Statistik Terpadu <br />
              BPS Kabupaten Tanjung Jabung Barat
            </h1>
          </div>

          <Link
            href="#layanan"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-200 font-medium text-sm sm:text-base hover:scale-105 transition duration-300 ease-in-out w-fit"
          >
            <HandHeartIcon size={18} />
            Layanan Kami
          </Link>
        </div>

        {/* Ilustrasi */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-64 sm:w-72 md:w-full max-w-sm">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* LAYANAN SECTION */}
      <div className="space-y-6" id="layanan">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center">
          Layanan Kami
        </h2>

        <Menu />
      </div>

    </div>
  );
}