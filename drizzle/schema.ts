import { pgTable, foreignKey, integer, varchar, date, text, timestamp, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const guests = pgTable("guests", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "guests_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	email: varchar({ length: 255 }).notNull(),
	phoneNumber: varchar({ length: 15 }).notNull(),
	organization: varchar({ length: 255 }).notNull(),
	visitedAt: date("visited_at").notNull(),
	purpose: text().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.email],
			foreignColumns: [users.email],
			name: "guests_email_users_email_fk"
		}),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	organization: varchar({ length: 255 }).notNull(),
	role: varchar().default('user').notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
