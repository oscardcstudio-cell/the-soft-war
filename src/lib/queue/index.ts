import { Queue, Worker, type Processor, QueueEvents, type ConnectionOptions } from "bullmq";
import IORedis from "ioredis";
import type { ModuleName } from "@/lib/db/schema";

/**
 * Lazy BullMQ connection options.
 * Doesn't throw at import time so `next build` works without REDIS_URL set.
 */
export function getBullConnection(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is not set");
  }
  return {
    url: redisUrl,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

/**
 * Standalone IORedis client (lazy) — used only for healthchecks.
 */
declare global {
  // eslint-disable-next-line no-var
  var __redis: IORedis | undefined;
}

export function getRedis(): IORedis {
  if (globalThis.__redis) return globalThis.__redis;
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is not set");
  }
  const client = new IORedis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__redis = client;
  }
  return client;
}

export const QUEUE_NAME = "pipeline";

export type PipelineJob = {
  projectId: string;
  module: ModuleName;
};

declare global {
  // eslint-disable-next-line no-var
  var __pipelineQueue: Queue<PipelineJob> | undefined;
}

export function getPipelineQueue(): Queue<PipelineJob> {
  const existing = globalThis.__pipelineQueue;
  if (existing) return existing;
  const queue = new Queue<PipelineJob>(QUEUE_NAME, { connection: getBullConnection() });
  globalThis.__pipelineQueue = queue;
  return queue;
}

export function getQueueEvents(): QueueEvents {
  return new QueueEvents(QUEUE_NAME, { connection: getBullConnection() });
}

export function createPipelineWorker(processor: Processor<PipelineJob>) {
  return new Worker<PipelineJob>(QUEUE_NAME, processor, {
    connection: getBullConnection(),
    concurrency: 4,
    autorun: true,
  });
}
