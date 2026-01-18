# ai360-leads-worker

Worker independiente para procesar leads en batch desde Supabase.

## Variables de Entorno

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
LEADS_BATCH_SIZE=5
LEADS_INTERVAL_SECONDS=300
```

## Desarrollo

```bash
cd worker
npm install
npx tsx src/index.ts
```

## Producción

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t ai360-leads-worker .
docker run -e SUPABASE_URL=... -e SUPABASE_SERVICE_ROLE_KEY=... ai360-leads-worker
```

## Estructura

```
worker/
├─ src/
│  ├─ index.ts          # Entry point
│  ├─ config.ts         # Environment config
│  ├─ db.ts             # Supabase client
│  ├─ worker.ts         # Main worker loop
│  ├─ jobs/
│  │  └─ processLeadJob.ts
│  └─ utils/
│     └─ sleep.ts
├─ package.json
├─ tsconfig.json
└─ Dockerfile
```
