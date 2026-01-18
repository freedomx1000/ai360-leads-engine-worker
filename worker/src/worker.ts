import { supabase } from "./db";
import { config } from "./config";
import { processLeadJob } from "./jobs/processLeadJob";

export async function runWorker() {
  console.log(`[worker] checking for pending jobs (batch: ${config.batchSize})`);

  const now = new Date().toISOString();
  const lockExpiry = new Date(Date.now() - config.lockTtlMs).toISOString();

  const { data: jobs, error } = await supabase
    .from("leads_jobs")
    .select("*")
    .eq("status", "pending")
    .or(`locked_at.is.null,locked_at.lt.${lockExpiry}`)
    .order("created_at", { ascending: true })
    .limit(config.batchSize);

  if (error) {
    console.error("[worker] fetch error:", error.message);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log("[worker] no pending jobs");
    return;
  }

  console.log(`[worker] processing ${jobs.length} jobs`);

  for (const job of jobs) {
    try {
      await supabase
        .from("leads_jobs")
        .update({ locked_at: now })
        .eq("id", job.id);

      await processLeadJob(job);

      console.log(`[worker] job ${job.id} done`);
    } catch (e: any) {
      console.error(`[worker] job ${job.id} failed:`, e.message);

      await supabase
        .from("leads_jobs")
        .update({
          status: "failed",
          last_error: e.message?.slice(0, 500),
          locked_at: null,
        })
        .eq("id", job.id);
    }
  }
}
