import { Queue, QueueEvents, type JobsOptions } from 'bullmq'
import { Redis } from 'ioredis'

export const EXAMPLE_QUEUE_NAME = 'example-jobs'
export const EXAMPLE_DLQ_NAME = 'example-jobs-dlq'

export type ExampleJobData = {
  jobId: string
  message: string
}

export function createRedisConnection(redisUrl: string) {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  })
}

export function createExampleQueue(connection: Redis) {
  return new Queue<ExampleJobData>(EXAMPLE_QUEUE_NAME, {
    connection,
  })
}

export function createExampleDeadLetterQueue(connection: Redis) {
  return new Queue<ExampleJobData & { reason: string }>(EXAMPLE_DLQ_NAME, {
    connection,
  })
}

export function createExampleQueueEvents(connection: Redis) {
  return new QueueEvents(EXAMPLE_QUEUE_NAME, {
    connection,
  })
}

export function createExampleJobOptions(jobId: string): JobsOptions {
  return {
    jobId,
    removeOnComplete: 100,
    removeOnFail: 100,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  }
}
