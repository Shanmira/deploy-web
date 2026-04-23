import { timestamps } from "@/lib/utils";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: t.varchar({ length: 255 }).notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  organization: t.varchar({ length: 255 }).notNull(),
  role: t
    .varchar({ enum: ["user", "admin", "operator"] })
    .default("user")
    .notNull(),
});

export const guestsTable = pgTable("guests", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  guestEmail: t
    .varchar("guest_email", { length: 255 })
    .references(() => usersTable.email)
    .notNull(),
  guestPhone: t
    .varchar("guest_phone", {length: 15})
    .notNull(),
  guestOrganization: t.varchar("guest_organization", { length: 255 }).notNull(),
  visitedAt: t.date("visited_at").notNull(),
  purpose: t.text().notNull(),
  updatedBy: t.varchar({ length: 255 }).references(() => usersTable.email),
  ...timestamps,
});

export const pengaduanTable = pgTable("pengaduan", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  reporter: t
    .varchar("reporter", { length: 255 })
    .references(() => usersTable.email)
    .notNull(),
  phone: t.varchar({ length: 255 }).notNull(),
  category: t.varchar({ length: 255 }).notNull(),
  eventDate: t.date("event_date").notNull(),
  suspect: t.varchar({ length: 255 }).notNull(),
  description: t.text().notNull(),
  proof: t.text().notNull(),
  status: t.varchar({ length: 255 }).$default(() => "Belum Ditindaklanjut"),
  ...timestamps,
});

export const whistleblowingTable = pgTable("whistleblowing", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  reporter: t
    .varchar("reporter", { length: 255 })
    .references(() => usersTable.email)
    .notNull(),
  phone: t.varchar({ length: 255 }).notNull(),
  category: t.varchar({ length: 255 }).notNull(),
  eventDate: t.date("event_date").notNull(),
  suspect: t.varchar({ length: 255 }).notNull(),
  description: t.text().notNull(),
  ...timestamps,
});
