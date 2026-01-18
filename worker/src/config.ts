export const config = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  batchSize: Number(process.env.LEADS_BATCH_SIZE ?? 5),
    workerId: process.env.WORKER_ID ?? 'worker-1',
  intervalMs: Number(process.env.POLL_MS ?? 1500),  lockTtlSeconds: Number(process.env.LEADS_LOCK_TTL_SECONDS ?? 300),
};
