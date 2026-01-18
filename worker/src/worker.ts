import { supabase } from "./db";
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
