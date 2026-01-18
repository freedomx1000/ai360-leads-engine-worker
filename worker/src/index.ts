import { runWorker } from "./worker";
import { config } from "./config";
import { sleep } from "./utils/sleep";
import { randomUUID } from "crypto";

const instanceId = randomUUID();

async function main() {
  console.log(`[leads-worker] started (instance: ${instanceId})`);
  console.log(`[leads-worker] batch=${config.batchSize}, interval=${config.intervalSeconds}s, lockTTL=${config.lockTtlSeconds}s`);

  while (true) {
    try {
      const result = await runWorker(instanceId);
      if (result.processed > 0) {
        console.log(`[leads-worker] processed ${result.processed} jobs`);
      }
    } catch (e: any) {
      console.error("[leads-worker] error:", e.message);
    }
    await sleep(config.intervalSeconds * 1000);
  }
}

main();
