import { runWorker } from "./worker";
import { config } from "./config";
import { sleep } from "./utils/sleep";

async function main() {
  console.log("[leads-worker] started");
  console.log(`[leads-worker] batch=${config.batchSize}, interval=${config.intervalMs / 1000}s, lockTTL=${config.lockTtlMs / 1000}s`);

  while (true) {
    try {
      await runWorker();
    } catch (e: any) {
      console.error("[leads-worker] error:", e.message);
    }
    await sleep(config.intervalMs);
  }
}

main();
