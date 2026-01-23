import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const cloudSync = pgTable("cloud_sync", {
  socialId: varchar("social_id").primaryKey(),
  provider: varchar("provider").notNull(),
  email: text("email"),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CloudSync = typeof cloudSync.$inferSelect;
export type InsertCloudSync = typeof cloudSync.$inferInsert;
