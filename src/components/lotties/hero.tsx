"use client";
import Lottie from "react-lottie";
import heroLottie from "./hero-illustration-3.json";
import bukuTamuLottie from "@/components/lotties/buku-tamu-illustration.json";
import permintaanDataLottie from "@/components/lotties/permintaan-data-illustration.json";
import siitungLottie from "@/components/lotties/siitung-illustration.json";
import statalkLottie from "@/components/lotties/statalk-illustration.json";
import notFoundLottie from "@/components/lotties/not-found-illustration.json";
import loginLottie from "@/components/lotties/login-illustration.json";
import pengaduanLottie from "@/components/lotties/pengaduan-illustration.json";
import dataLottie from "@/components/lotties/survei-data-illustration.json";
import { useWidth } from "@/hooks/usewidth";

export const HeroIllustration = () => {
  const { width } = useWidth();
  return (
    <Lottie
      options={{
        animationData: heroLottie,
        loop: true,
        autoplay: true,
      }}
      width={width && width > 760 ? 600 : 300}
    />
  );
};

export const Illustration = ({ animationData, lottieWidth, loop = true }: { animationData: object; lottieWidth?: number; loop?: boolean }) => {
  const { width } = useWidth();
  let finalWidth = 150;
  if (lottieWidth) {
    finalWidth = lottieWidth;
  }
  return (
    <Lottie
      options={{
        animationData: animationData,
        loop: loop,
        autoplay: true,
      }}
      width={width && width > 760 ? finalWidth : (finalWidth * 2) / 3}
    />
  );
};

export const BukuTamuIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({ animationData: bukuTamuLottie, lottieWidth });
};

export const PermintaanDataIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({ animationData: permintaanDataLottie, lottieWidth });
};

export const SiitungIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({ animationData: siitungLottie, lottieWidth });
};

export const StatalkIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({ animationData: statalkLottie, lottieWidth });
};
export const DataIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({ animationData: dataLottie, lottieWidth });
};
export const NotFoundIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({ animationData: notFoundLottie, lottieWidth });
};

export const LoginIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({ animationData: loginLottie, lottieWidth, loop: false });
};

export const PengaduanIllustration = ({ lottieWidth }: { lottieWidth?: number }) => {
  return Illustration({
    animationData: pengaduanLottie,
    lottieWidth,
    loop: true,
  });
};
