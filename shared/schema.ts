import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  jobTitle: text("job_title"),
  
  // Processing fields
  status: text("status").notNull().default("new"), // new, processing, completed, failed
  score: integer("score").default(0),
  
  // Data storage
  rawData: jsonb("raw_data").$type<Record<string, any>>().default({}),
  enrichedData: jsonb("enriched_data").$type<Record<string, any>>().default({}),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  
  // Metadata
  source: text("source").default("manual"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ 
  id: true, 
  createdAt: true, 
  processedAt: true,
  enrichedData: true,
  score: true,
  status: true 
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type CreateLeadRequest = InsertLead;
export type UpdateLeadRequest = Partial<InsertLead>;

// Stats for dashboard
export interface LeadStats {
  total: number;
  processed: number;
  avgScore: number;
  pending: number;
}
