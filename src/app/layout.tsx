import type { Metadata } from "next";
import { RootProvider } from "@/provider/root";
import { Plus_Jakarta_Sans } from "next/font/google";
import { auth } from "@/lib/auth";
import "./globals.css";
import Navbar from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { Toaster } from "@/components/ui/toaster";
import FloatingChat from "@/components/sections/floating-chat";

const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pelayanan Statistik Terpadu - 1507",
  description:
    "Aplikasi Pelayanan Statistik BPS Kabupaten Tanjung Jabung Barat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();

  return (
    <html lang="en" className="scroll-smooth"> 
      <RootProvider session={session}>
        <body className={`${pjs.className} antialiased relative `}>
          <Navbar />
          <div className="m-auto">{children}</div>
          <Toaster></Toaster>
          <FloatingChat/>
          <Footer />
        </body>
      </RootProvider>
    </html>
  );
}
