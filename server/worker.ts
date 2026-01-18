import { supabase } from "./supabase";
import { config } from "./config";
import { processLeadJob } from "./jobs/processLeadJob";
import { sleep } from "./utils/sleep";

export async function startWorker() {
  console.log(`Worker started. Batch size: ${config.batchSize}, Interval: ${config.intervalMs}ms`);

  while (true) {
    try {
      // Fetch pending jobs
      const { data: jobs, error } = await supabase
        .from("leads_jobs")
        .select("*")
        .eq("status", "pending")
        .limit(config.batchSize);

      if (error) {
        console.error("Error fetching jobs:", error);
      } else if (jobs && jobs.length > 0) {
        console.log(`Processing ${jobs.length} jobs...`);
        
        for (const job of jobs) {
          try {
            await processLeadJob(job);
            console.log(`Job ${job.id} completed`);
          } catch (err) {
            console.error(`Error processing job ${job.id}:`, err);
            
            // Mark job as failed
            await supabase
              .from("leads_jobs")
              .update({
                status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", job.id);
          }
        }
      } else {
        console.log("No pending jobs found");
      }
    } catch (err) {
      console.error("Worker loop error:", err);
    }

    await sleep(config.intervalMs);
  }
}

// Process a single lead manually (for API trigger)
export async function processLeadById(leadId: number) {
  // Create a job entry or process directly
  const { data: lead, error } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  // Process directly
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
