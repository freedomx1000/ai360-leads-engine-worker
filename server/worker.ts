import { supabase } from "./supabase";
import { config } from "./config";
import { processLeadJob } from "./jobs/processLeadJob";

export async function runWorker() {
  const { data: jobs } = await supabase
    .from("leads_jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(config.batchSize);

  if (!jobs || jobs.length === 0) return;

  for (const job of jobs) {
    try {
      await processLeadJob(job);
    } catch (e: any) {
      await supabase
        .from("leads_jobs")
        .update({
          status: "failed",
          last_error: e.message?.slice(0, 500),
        })
        .eq("id", job.id);
    }
  }
}

// Process a single lead manually (for API trigger)
export async function processLeadById(leadId: number) {
  const { data: lead, error } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  const score = 10;
  const notes = `Manually processed at ${new Date().toISOString()}`;

  await supabase
    .from("crm_leads")
    .update({
      score,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  return { success: true, score };
}
