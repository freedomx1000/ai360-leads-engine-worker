# ai360-leads-worker

Standalone background worker for processing leads in batch from Supabase.

## Environment Variables

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
LEADS_BATCH_SIZE=5
LEADS_INTERVAL_SECONDS=120
LEADS_LOCK_TTL_SECONDS=300
```

## Deploy to Render

1. Create new **Background Worker** service
2. Point to this repo (or `/worker` directory)
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)

## Local Development

```bash
cd worker
npm install
npx tsx src/index.ts
```

## Production Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t ai360-leads-worker .
docker run \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e LEADS_BATCH_SIZE=5 \
  -e LEADS_INTERVAL_SECONDS=120 \
  -e LEADS_LOCK_TTL_SECONDS=300 \
  ai360-leads-worker
```

## Architecture

```
worker/
├─ src/
│  ├─ index.ts          # Entry point (infinite loop)
│  ├─ config.ts         # Environment config
│  ├─ db.ts             # Supabase client
│  ├─ worker.ts         # Main worker: fetches pending jobs
│  ├─ jobs/
│  │  └─ processLeadJob.ts  # Job processor: enrich + score + update
│  └─ utils/
│     └─ sleep.ts
├─ package.json
├─ tsconfig.json
├─ render.yaml          # Render deployment config
└─ Dockerfile
```

## How It Works

1. Worker polls `leads_jobs` table for `status = 'pending'`
2. Fetches batch of jobs (default: 5)
3. For each job:
   - Enriches lead data
   - Calculates score
   - Updates `crm_leads` table
   - Marks job as `done` or `failed`
4. Sleeps for interval (default: 120s)
5. Repeats
