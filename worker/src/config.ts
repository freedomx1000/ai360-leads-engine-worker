export const config = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  batchSize: Number(process.env.LEADS_BATCH_SIZE ?? 5),
  intervalMs: Number(process.env.LEADS_INTERVAL_SECONDS ?? 300) * 1000,
  lockTtlSeconds: Number(process.env.LEADS_LOCK_TTL_SECONDS ?? 300),
};
