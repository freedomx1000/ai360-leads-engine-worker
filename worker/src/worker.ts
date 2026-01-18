import { supabase } from "./db";
import { config } from "./config";
import { processLeadJob } from "./jobs/processLeadJob";

export async function runWorker(instanceId: string) {
  // Call RPC function to claim jobs
  const { data: jobs, error } = await supabase
    .rpc('claim_next_job', {
      p_worker: config.workerId,
      p_types: ['process_lead'],
      p_limit: config.batchSize
    });

  if (error) {
    console.error('[leads-worker] claim error:', error);
    return { processed: 0 };
  }

  if (!jobs || jobs.length === 0) {
    console.log(`[leads-worker] claimed 0 jobs`);
    return { processed: 0 };
  }

  console.log(`[leads-worker] claimed ${jobs.length} jobs`);
  let processed = 0;

  for (const job of jobs) {
    try {
      await processLeadJob(job);
      
      // Mark job as done
      const { error: doneErr } = await supabase
        .rpc('mark_job_done', { p_job_id: job.id });
        
      if (doneErr) {
        console.error(`[leads-worker] mark_job_done error:`, doneErr);
      } else {
        processed++;
      }
    } catch (e: any) {
      const msg = (e?.message ?? String(e)).slice(0, 1500);
      
      // Mark job as failed
      const { error: failErr } = await supabase
        .rpc('mark_job_failed', {
          p_job_id: job.id,
          p_error: msg
        });
        
      if (failErr) {
        console.error(`[leads-worker] mark_job_failed error:`, failErr);
      }
    }
  }

  return { processed };
}
