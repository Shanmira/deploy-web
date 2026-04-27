import Image from "next/image";
import Link from "next/link";

export const LogoBig = () => {
  return (
    <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14">
      <Image
        src={"/assets/images/lumina2.png"}
        fill
        alt="logo-lumina2"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
};

export const LogoWithTitleBig = () => {
  return (
    <div className="flex space-x-2 sm:space-x-4 items-center">
      <div className="relative h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex-shrink-0">
        <Image
          src={"/assets/images/lumina2.png"}
          fill
          alt="lumina2"
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-xs sm:text-sm font-bold italic leading-tight">
          Layanan Unggulan Menyajikan Statistik
        </h1>
        <p className="text-[10px] sm:text-xs italic text-gray-500">
          BPS Kabupaten Tanjung Jabung Barat
        </p>
      </div>
    </div>
  );
};

export default function Logo() {
  return (
    <Link className="flex items-center" href="/">
      <div className="relative h-8 w-[100px] md:ml-16 sm:h-10 sm:w-[140px] md:h-12 md:w-[180px] lg:h-14 lg:w-[220px]">
        <Image
          src={"/assets/images/lumina2.png"}
          fill
          alt="lumina2"
          style={{ objectFit: "contain", objectPosition: "left center" }}
          priority
        />
      </div>
    </Link>
  );
}

export const GoogleLogo = () => {
  return (
    <Image
      src="/assets/images/logo-google.png"
      alt="google_logo"
      height={24}
      width={24}
    />
  );
};

export const LogoNavbar = () => {};