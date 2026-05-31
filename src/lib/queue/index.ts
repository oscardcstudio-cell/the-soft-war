import { Queue, Worker, type Processor, QueueEvents, type ConnectionOptions } from "bullmq";
import IORedis from "ioredis";
import type { ModuleName } from "@/lib/db/schema";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is not set");
}

/**
 * BullMQ connection options (passed to Queue/Worker — BullMQ instantiates its own Redis).
 * We don't pass a shared IORedis instance because BullMQ ships a nested ioredis copy
 * and the types diverge between the two.
 */
export const bullConnection: ConnectionOptions = {
  url: redisUrl,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

/**
 * Standalone IORedis client — used only for healthchecks and ad-hoc commands
 * (NOT for BullMQ, which has its own connection).
 */
declare global {
  // eslint-disable-next-line no-var
  var __redis: IORedis | undefined;
}

export const connection: IORedis = globalThis.__redis ?? new IORedis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});
if (process.env.NODE_ENV !== "production") {
  globalThis.__redis = connection;
}

export const QUEUE_NAME = "pipeline";

export type PipelineJob = {
  projectId: string;
  module: ModuleName;
};

// Producer (lazy)
declare global {
  // eslint-disable-next-line no-var
  var __pipelineQueue: Queue<PipelineJob> | undefined;
}

export function getPipelineQueue(): Queue<PipelineJob> {
  const existing = globalThis.__pipelineQueue;
  if (existing) return existing;
  const queue = new Queue<PipelineJob>(QUEUE_NAME, { connection: bullConnection });
  globalThis.__pipelineQueue = queue;
  return queue;
}

export function getQueueEvents(): QueueEvents {
  return new QueueEvents(QUEUE_NAME, { connection: bullConnection });
}

export function createPipelineWorker(processor: Processor<PipelineJob>) {
  return new Worker<PipelineJob>(QUEUE_NAME, processor, {
    connection: bullConnection,
    concurrency: 4,
    autorun: true,
  });
}
