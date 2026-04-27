"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

import heroLottie from "./hero-illustration-3.json";
import bukuTamuLottie from "@/components/lotties/buku-tamu-illustration.json";
import permintaanDataLottie from "@/components/lotties/permintaan-data-illustration.json";
import siitungLottie from "@/components/lotties/siitung-illustration.json";
import statalkLottie from "@/components/lotties/statalk-illustration.json";
import notFoundLottie from "@/components/lotties/not-found-illustration.json";
import loginLottie from "@/components/lotties/login-illustration.json";
import pengaduanLottie from "@/components/lotties/pengaduan-illustration.json";
import dataLottie from "@/components/lotties/survei-data-illustration.json";

// ─── Wrapper aman — mencegah error destroy() dari react-lottie ──────────────
interface SafeLottieProps {
  animationData: object;
  loop?: boolean;
  className?: string;
}

function SafeLottie({ animationData, loop = true, className = "w-full h-full" }: SafeLottieProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      try {
        lottieRef.current?.destroy();
      } catch {
        // Abaikan error saat unmount
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay
      className={className}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}

// ─── Komponen individual ────────────────────────────────────────────────────
// Ukuran dikontrol dari luar via className parent, bukan props width
// Contoh penggunaan: <div className="w-64 h-64"><HeroIllustration /></div>

export const HeroIllustration = () => (
  <SafeLottie animationData={heroLottie} />
);

export const BukuTamuIllustration = ({ loop = true }: { loop?: boolean }) => (
  <SafeLottie animationData={bukuTamuLottie} loop={loop} />
);

export const PermintaanDataIllustration = ({ loop = true }: { loop?: boolean }) => (
  <SafeLottie animationData={permintaanDataLottie} loop={loop} />
);

export const SiitungIllustration = ({ loop = true }: { loop?: boolean }) => (
  <SafeLottie animationData={siitungLottie} loop={loop} />
);

export const StatalkIllustration = ({ loop = true }: { loop?: boolean }) => (
  <SafeLottie animationData={statalkLottie} loop={loop} />
);

export const DataIllustration = ({ loop = true }: { loop?: boolean }) => (
  <SafeLottie animationData={dataLottie} loop={loop} />
);

export const NotFoundIllustration = ({ loop = true }: { loop?: boolean }) => (
  <SafeLottie animationData={notFoundLottie} loop={loop} />
);

export const LoginIllustration = () => (
  <SafeLottie animationData={loginLottie} loop={false} />
);

export const PengaduanIllustration = ({ loop = true }: { loop?: boolean }) => (
  <SafeLottie animationData={pengaduanLottie} loop={loop} />
);