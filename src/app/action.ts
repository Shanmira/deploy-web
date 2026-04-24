"use server"; 
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { guestsTable, pengaduanTable, usersTable,whistleblowingTable } from "@/db/schema";
import { auth } from "@/lib/auth";


export async function encryptState(state: string) {
  const { encrypt } = await import("@/lib/encryption");
  return encrypt(state);
}

export const addUser = async ({
  name,
  email,
  organization,
  role,
}: {
  name: string;
  email: string;
  organization: string;
  role: "user" | "admin";
}) => {
  try {
    await db.insert(usersTable).values({
      name: name,
      email: email,
      organization: organization,
      role: role,
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const getUserByEmail = async (email: string) => {
  return await db.select().from(usersTable).where(eq(usersTable.email, email));
};

export const updateUserByEmail = async ({
  email,
  name,
  organization,
  role,
}: {
  email: string;
  name: string;
  organization: string;
  role: "user" | "admin" | "operator";
}) => {
  try {
    await db
      .update(usersTable)
      .set({ name: name, organization: organization, role: role })
      .where(eq(usersTable.email, email));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const addGuest = async ({
  email,
  phone,
  organization,
  visitedAt,
  purpose,
}: {
  email: string;
  phone: string;
  organization: string;
  visitedAt: Date;
  purpose: string;
}) => {
  try {
    await db.insert(guestsTable).values({
      guestEmail: email,
      guestPhone: phone,
      guestOrganization: organization,
      visitedAt: visitedAt.toISOString(),
      purpose: purpose,
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const updateGuest = async ({
  id,
  purpose,
}: {
  id: number;
  purpose: string;
}) => {
  try {
    await db
      .update(guestsTable)
      .set({ purpose: purpose, updatedAt: new Date() })
      .where(eq(guestsTable.id, id));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const deleteGuest = async ({ id }: { id: number }) => {
  try {
    await db.delete(guestsTable).where(eq(guestsTable.id, id));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const getGuests = async () => {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return await db
    .select()
    .from(guestsTable)
    .leftJoin(usersTable, eq(guestsTable.guestEmail, usersTable.email));
};

export const addPengaduan = async ({
  email,
  phone,
  category,
  suspect,
  reportedAt,
  description,
  proof,
}: {
  email: string;
  phone: string;
  category: string;
  suspect: string;
  reportedAt: Date;
  description: string;
  proof: string;
}) => {
  try {
    await db.insert(pengaduanTable).values({
      reporter: email,
      phone: phone,
      category: category,
      suspect: suspect,
      eventDate: reportedAt.toISOString(),
      description: description,
      proof: proof,
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const updatePengaduan = async ({
  id,
  reporter,
  phone,
  category,
  suspect,
  reportedAt,
  description,
  proof,
  status,
}: {
  id: number;
  reporter: string;
  phone: string;
  category: string;
  suspect: string;
  reportedAt: string;
  description: string;
  proof: string;
  status: string;
}) => {
  try {
    await db
      .update(pengaduanTable)
      .set({
        reporter: reporter,
        phone,
        category,
        suspect,
        eventDate: reportedAt,
        description,
        proof,
        updatedAt: new Date(),
        status,
      })
      .where(eq(pengaduanTable.id, id));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const deletePengaduan = async ({ id }: { id: number }) => {
  try {
    await db.delete(pengaduanTable).where(eq(pengaduanTable.id, id));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const getPengaduan = async () => {
  return await db
    .select()
    .from(pengaduanTable)
    .leftJoin(usersTable, eq(pengaduanTable.reporter, usersTable.email));
};

export const addWhistleblowing = async ({
  email,
  phone,
  category,
  suspect,
  reportedAt,
  description,
  proof,
}: {
  email: string;
  phone: string;
  category: string;
  suspect: string;
  reportedAt: Date;
  description: string;
  proof: string;
}) => {
  try {
    await db.insert(whistleblowingTable).values({
      reporter: email,
      phone: phone,
      category: category,
      suspect: suspect,
      eventDate: reportedAt.toISOString(),
      description: description,
      proof: proof,
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const updateWhistleBlowing = async ({
  id,
  reporter,
  phone,
  category,
  suspect,
  reportedAt,
  description,
  proof,
  status,
}: {
  id: number;
  reporter: string;
  phone: string;
  category: string;
  suspect: string;
  reportedAt: string;
  description: string;
  proof: string;
  status: string;
}) => {
  try {
    await db
      .update(whistleblowingTable)
      .set({
        reporter: reporter,
        phone,
        category,
        suspect,
        eventDate: reportedAt,
        description,
        proof,
        updatedAt: new Date(),
        status,
      })
      .where(eq(whistleblowingTable.id, id));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const deleteWhistleblowing = async ({ id }: { id: number }) => {
  try {
    await db.delete(whistleblowingTable).where(eq(whistleblowingTable.id, id));
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
      return false;
    }
  }
  return true;
};

export const getWhistleBlowing = async () => {
  return await db
    .select()
    .from(whistleblowingTable)
    .leftJoin(usersTable, eq(whistleblowingTable.reporter, usersTable.email));
};