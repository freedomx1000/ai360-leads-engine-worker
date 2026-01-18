import { db } from "./db";
import { leads, type InsertLead, type Lead, type LeadStats } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getLeads(status?: string): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead>;
  getStats(): Promise<LeadStats>;
}

export class DatabaseStorage implements IStorage {
  async getLeads(status?: string): Promise<Lead[]> {
    if (status) {
      return await db.select().from(leads).where(eq(leads.status, status)).orderBy(desc(leads.createdAt));
    }
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead> {
    const [updated] = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async getStats(): Promise<LeadStats> {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        processed: sql<number>`count(*) filter (where ${leads.status} = 'completed')`,
        avgScore: sql<number>`avg(${leads.score})`,
        pending: sql<number>`count(*) filter (where ${leads.status} = 'new')`,
      })
      .from(leads);

    return {
      total: Number(stats?.total || 0),
      processed: Number(stats?.processed || 0),
      avgScore: Math.round(Number(stats?.avgScore || 0)),
      pending: Number(stats?.pending || 0),
    };
  }
}

export const storage = new DatabaseStorage();
