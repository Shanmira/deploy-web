import React from "react";
import { Session } from "next-auth";
import { AuthProvider } from "./auth-provider";
export const RootProvider = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  return <AuthProvider session={session}>{children}</AuthProvider>;
};
