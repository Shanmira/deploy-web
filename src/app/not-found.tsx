"use client";
import dynamic from "next/dynamic";
// import { NotFoundIllustration } from "@/components/lotties/hero";
import Link from "next/link";
import React from "react";
import animationData from "@/components/lotties/not-found-illustration.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type NotFoundIllustrationProps = {
  lottieWidth?: number
}

const NotFoundIllustration = ({ lottieWidth = 200 }: NotFoundIllustrationProps) => {
  return (
    <div style={{ width: lottieWidth }}>
            <Lottie animationData={animationData} loop={true} />
    </div>
  )
}

const NotFound = () => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center">
      <NotFoundIllustration lottieWidth={600} />
      <Link href="/" className="underline">
        Beranda
      </Link>
    </div>
  );
};

export default NotFound;
