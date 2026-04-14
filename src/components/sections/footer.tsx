import Link from "next/link";
import React from "react";
import Image from "next/image";
import {
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";
const SOCIAL_MEDIA = [
  {
    title: "tanjabbarkab.bps.go.id",
    href: "https://tanjabbarkab.bps.go.id",
    icon: <GlobeIcon />,
  },
  {
    title: "bps_tanjabbar",
    href: "https://www.instagram.com/bps_tanjabbar/",
    icon: <InstagramIcon />,
  },
  {
    title: "tanjabbarkab",
    href: "https://www.facebook.com/tanjabbarkab",
    icon: <FacebookIcon />,
  },
  {
    title: "bps1507@bps.go.id",
    href: "mailto:bps1507@bps.go.id",
    icon: <MailIcon />,
  },
  {
    title: "082173054213",
    href: "https://wa.me/6282173054213",
    icon: <PhoneIcon />,
  },
];
export const Footer = () => {
  return (
    <div className="bg-blue-950 py-8 w-full">
      <div className="text-white  h-fit w-11/12 md:w-10/12 grid grid-cols-1 md:grid-cols-3 gap-4 m-auto">
        <div className="space-y-4">
          <Link className="flex" href="https://tanjabbarkab.bps.go.id">
            <Image
              src={"/assets/images/logo-bps.webp"}
              height={36}
              width={56}
              alt="logo-bps"
              className="mr-4"
            />
            <p className="italic font-semibold">
              {" "}
              Badan Pusat Statistik <br />
              Kabupaten Tanjung Jabung Barat
            </p>
          </Link>
          <p className="text-xs">
            Jl. Prof. Dr. Sri Soedewi MS., SH., Kuala Tungkal Telp. (0742) 21378
            Homepage: http://tanjabbarkab.bps.go.id E-mail: bps1507@bps.go.id
          </p>
        </div>
        <div className="w-full flex justify-center text-xs md:text-sm"></div>
        <ul className="text-xs md:text-sm self-center m-auto w-full items-center justify-center grid grid-cols-2 gap-4">
          {SOCIAL_MEDIA.map((sosmed) => (
            <li key={sosmed.title}>
              <Link
                href={sosmed.href}
                className="hover:underline flex space-x-2"
              >
                <div className="mr-4">{sosmed.icon}</div> {sosmed.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <hr className="my-8 border-dashed" />
      <div className="w-full flex justify-center text-xs md:text-sm p-4">
        <Link
          href="https://tanjabbarkab.bps.go.id"
          className="hover:underline text-center text-white cursor-pointer"
        >
          © Copyright{" "}
          <strong>
            Badan Pusat Statistik Kabupaten Tanjung Jabung Barat 2024
          </strong>
        </Link>
      </div>
    </div>
  );
};
