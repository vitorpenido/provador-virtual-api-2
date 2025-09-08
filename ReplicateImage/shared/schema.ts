import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const generations = pgTable("generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prompt: text("prompt").notNull(),
  imageUrls: json("image_urls").$type<string[]>().default([]),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  resultUrl: text("result_url"),
  replicateId: text("replicate_id"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGenerationSchema = createInsertSchema(generations).pick({
  prompt: true,
  imageUrls: true,
});

export const generationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  imageUrls: z.array(z.string().url()).min(1, "At least one image is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type GenerationRequest = z.infer<typeof generationRequestSchema>;
