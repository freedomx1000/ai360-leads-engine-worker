import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { processLeadJob } from "./worker";

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
      const lead = await storage.createLead(input);
      
      // Optionally trigger processing immediately?
      // For now, let's keep it manual or separate
      
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

    // Trigger async job (fire and forget for response, but await for this demo to show result)
    // In production, push to queue. Here we just call the function.
    processLeadJob(id).catch(console.error);

    res.json({ success: true, message: "Processing started" });
  });

  // Stats
  app.get(api.leads.stats.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  return httpServer;
}

// Seed Data
async function seedDatabase() {
  const existing = await storage.getLeads();
  if (existing.length === 0) {
    console.log("Seeding database...");
    await storage.createLead({
      email: "elon@tesla.com",
      name: "Elon Musk",
      company: "Tesla",
      jobTitle: "CEO",
      source: "seed",
      status: "new"
    });
    await storage.createLead({
      email: "engineer@startup.io",
      name: "Jane Doe",
      company: "Startup Inc",
      jobTitle: "Senior Engineer",
      source: "seed",
      status: "new"
    });
    await storage.createLead({
      email: "mark@facebook.com",
      name: "Mark Zuckerberg",
      company: "Meta",
      jobTitle: "Founder",
      source: "seed",
      status: "new"
    });
    console.log("Seeding complete.");
  }
}

// Hook into server start to seed
setTimeout(seedDatabase, 2000);
