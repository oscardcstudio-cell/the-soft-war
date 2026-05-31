/**
 * Standalone worker process.
 * Run with : `npm run worker:dev` (local) or as a Railway service.
 */
import "dotenv/config";
import { createPipelineWorker, type PipelineJob } from "../../src/lib/queue";
import type { Job } from "bullmq";

// Skeleton processor — Phase 3 will wire actual module pipelines via Mastra.
async function processJob(job: Job<PipelineJob>) {
  const { projectId, module } = job.data;
  console.log(`[worker] picked up project=${projectId} module=${module} (attempt ${job.attemptsMade + 1})`);

  // TODO Phase 3 : route to the right module handler
  // const handler = MODULE_HANDLERS[module];
  // await handler({ projectId });

  // Placeholder : echo and complete
  await new Promise((r) => setTimeout(r, 500));
  return { status: "ok", module };
}

console.log("[worker] starting…");
const worker = createPipelineWorker(processJob);

worker.on("ready", () => console.log("[worker] ready"));
worker.on("active", (job) => console.log(`[worker] active job=${job.id}`));
worker.on("completed", (job, result) => console.log(`[worker] completed job=${job.id}`, result));
worker.on("failed", (job, err) => console.error(`[worker] failed job=${job?.id}`, err.message));
worker.on("error", (err) => console.error("[worker] error", err));

// Graceful shutdown
const shutdown = async (sig: string) => {
  console.log(`[worker] ${sig} received, closing…`);
  await worker.close();
  process.exit(0);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
