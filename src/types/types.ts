import { pengaduanTable } from "@/db/schema";

export type URL_STATE = {
  message: string;
  redirect_url: string | null;
};

export type GUEST = {
  id: number;
  visitedAt: string;
  purpose: string;
  guestEmail: string;
  guestPhone: string;
  guestOrganization: string;
  updatedBy: string | null;
  updatedAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
};

export type PENGADUAN = typeof pengaduanTable.$inferSelect;

export type USER = {
  email: string;
  id: number;
  role: "user" | "admin" | "operator";
  name: string;
  organization: string;
};

export type GUEST_ACTION_RES = { guests: GUEST; users: USER | null };
export type PENGADUAN_ACTION_RES = {
  pengaduan: PENGADUAN;
  users: USER | null;
};
