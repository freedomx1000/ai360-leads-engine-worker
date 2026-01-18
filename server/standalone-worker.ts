import { runWorker } from "./worker";
import { config } from "./config";
import { sleep } from "./utils/sleep";

async function main() {
  console.log("[leads-worker] started");

  while (true) {
    await runWorker();
    await sleep(config.intervalMs);
  }
}

main();
