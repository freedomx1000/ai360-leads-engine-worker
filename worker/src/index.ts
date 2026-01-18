import { runWorker } from "./worker";
import { config } from "./config";
import { sleep } from "./utils/sleep";
import crypto from "crypto";

async function main() {
  const instanceId = `leads-${crypto.randomUUID().slice(0, 8)}`;
  console.log(`[leads-worker] started instance=${instanceId} interval=${config.intervalMs}ms`);

  while (true) {
    const t0 = Date.now();
    const res = await runWorker(instanceId);
    const dt = Date.now() - t0;

    if (res.processed > 0) {
      console.log(`[leads-worker] processed=${res.processed} dt=${dt}ms`);
    }

    await sleep(config.intervalMs);
  }
}

main().catch((e) => {
  console.error("[leads-worker] fatal", e);
  process.exit(1);
});
