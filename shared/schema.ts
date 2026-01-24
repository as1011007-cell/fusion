import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const cloudSync = pgTable("cloud_sync", {
  userId: varchar("user_id").primaryKey(),
  email: text("email"),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CloudSync = typeof cloudSync.$inferSelect;
export type InsertCloudSync = typeof cloudSync.$inferInsert;
