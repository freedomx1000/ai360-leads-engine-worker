import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { processLeadById } from "./worker";
import { supabase } from "./supabase";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // List Leads
  app.get(api.leads.list.path, async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const leads = await storage.getLeads(status);
    res.json(leads);
  });

  // Get Lead
  app.get(api.leads.get.path, async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  });

  // Create Lead
  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead({
        email: input.email,
        name: input.name,
        company: input.company,
        job_title: input.jobTitle,
        source: input.source,
      });
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Process Lead
  app.post(api.leads.process.path, async (req, res) => {
    const id = Number(req.params.id);
    const lead = await storage.getLead(id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Trigger processing
    processLeadById(id).catch(console.error);

    res.json({ success: true, message: "Processing started" });
  });

  // Stats
  app.get(api.leads.stats.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Jobs endpoint (for monitoring)
  app.get("/api/jobs", async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const jobs = await storage.getJobs(status);
    res.json(jobs);
  });


    // Events Ingest endpoint
  app.post("/api/events/ingest", async (req, res) => {
    try {
      const { org_id, lead_id, event_type, event_data } = req.body;

      // Validate required fields
      if (!org_id || !event_type) {
        return res.status(400).json({ 
          ok: false, 
          error: 'org_id and event_type are required' 
        });
      }

      // Insert event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          org_id,
          lead_id: lead_id || null,
          event_type,
          event_data: event_data || {}
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Check if event is "strong" and should enqueue a job
      const strongEvents = [
        'post_create',
        'pricing_view',
        'demo_request',
        'return_visit',
        'lead.created',
        'lead.enriched'
      ];

      let job_enqueued = false;

      if (strongEvents.includes(event_type) && lead_id) {
        // Check for existing job (dedupe)
        const { data: existingJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('payload->lead_id', lead_id)
          .in('status', ['queued', 'processing'])
          .limit(1);

        if (!existingJobs || existingJobs.length === 0) {
          // Enqueue job
          const { error: jobError } = await supabase
            .from('jobs')
            .insert({
              org_id,
              job_type: 'process_lead',
              payload: { lead_id },
              status: 'queued',
              priority: 10,
              attempts: 0,
              max_attempts: 10
            });

          if (!jobError) {
            job_enqueued = true;
          }
        }
      }

      res.json({
        ok: true,
        event_id: event.id,
        job_enqueued
      });
    } catch (err) {
      console.error('Events ingest error:', err);
      res.status(500).json({ 
        ok: false, 
        error: err instanceof Error ? err.message : 'Internal server error' 
      });
    }
  });

  return httpServer;
}
