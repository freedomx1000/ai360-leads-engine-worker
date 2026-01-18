import { supabase } from "./supabase";
import type { LeadStats } from "@shared/schema";

// Types matching Supabase tables
export interface CrmLead {
  id: number;
  email: string;
  name: string | null;
  company: string | null;
  job_title: string | null;
  score: number | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface LeadsJob {
  id: number;
  lead_id: number | null;
  source_url: string | null;
  canonical_url: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

export interface IStorage {
  getLeads(status?: string): Promise<CrmLead[]>;
  getLead(id: number): Promise<CrmLead | null>;
  createLead(lead: Partial<CrmLead>): Promise<CrmLead>;
  updateLead(id: number, updates: Partial<CrmLead>): Promise<CrmLead | null>;
  getStats(): Promise<LeadStats>;
  getJobs(status?: string): Promise<LeadsJob[]>;
}

export class SupabaseStorage implements IStorage {
  async getLeads(status?: string): Promise<CrmLead[]> {
    let query = supabase
      .from("crm_leads")
      .select("*")
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      return [];
    }

    return data || [];
  }

  async getLead(id: number): Promise<CrmLead | null> {
    const { data, error } = await supabase
      .from("crm_leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lead:", error);
      return null;
    }

    return data;
  }

  async createLead(lead: Partial<CrmLead>): Promise<CrmLead> {
    const { data, error } = await supabase
      .from("crm_leads")
      .insert(lead)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating lead: ${error.message}`);
    }

    return data;
  }

  async updateLead(id: number, updates: Partial<CrmLead>): Promise<CrmLead | null> {
    const { data, error } = await supabase
      .from("crm_leads")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating lead:", error);
      return null;
    }

    return data;
  }

  async getStats(): Promise<LeadStats> {
    const { data: leads, error } = await supabase
      .from("crm_leads")
      .select("score");

    if (error || !leads) {
      return { total: 0, processed: 0, avgScore: 0, pending: 0 };
    }

    const total = leads.length;
    const processed = leads.filter((l) => l.score && l.score > 0).length;
    const pending = total - processed;
    const avgScore = processed > 0
      ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / processed)
      : 0;

    return { total, processed, avgScore, pending };
  }

  async getJobs(status?: string): Promise<LeadsJob[]> {
    let query = supabase
      .from("leads_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }

    return data || [];
  }
}

export const storage = new SupabaseStorage();
