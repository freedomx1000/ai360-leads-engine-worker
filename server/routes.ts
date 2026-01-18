import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { processLeadById } from "./worker";

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

  return httpServer;
}
