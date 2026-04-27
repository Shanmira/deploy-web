"use client";
import { encrypt } from "@/lib/encryption";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { encryptState } from "@/app/action"
import React, { Suspense, useEffect } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading" || status === "unauthenticated") {
      const message = "Silahkan login terlebih dahulu 😁";
      const state = { message: message, redirect_url: pathname };
      const stateString = JSON.stringify(state);

      encryptState(stateString).then((stateUrl) => {
        router.replace(`/auth/login?state=${stateUrl}`);
      });
    }
  }, [status]);

  return (
    <div>
      <Suspense>{children}</Suspense>
    </div>
  );
};

export default Layout;
