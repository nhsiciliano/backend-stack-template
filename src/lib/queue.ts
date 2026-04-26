import { Queue, QueueEvents, type JobsOptions } from 'bullmq'
import { Redis } from 'ioredis'
import type { AppConfig } from '../config/env.js'

export const EXAMPLE_QUEUE_NAME = 'example-jobs'
export const EXAMPLE_DLQ_NAME = 'example-jobs-dlq'

export type ExampleJobData = {
  jobId: string
  message: string
}

export type DeadLetterJobData<TData extends object> = TData & {
  reason: string
  failedAt: string
}

export type QueueDefinition<TData extends object = object> = {
  name: string
  deadLetterName: string
  data?: TData
}

export const exampleQueueDefinition: QueueDefinition<ExampleJobData> = {
  name: EXAMPLE_QUEUE_NAME,
  deadLetterName: EXAMPLE_DLQ_NAME,
}

export function createRedisConnection(redisUrl: string) {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  })
}

export function createQueue<TData extends object>(definition: QueueDefinition<TData>, connection: Redis) {
  return new Queue<TData>(definition.name, {
    connection,
  })
}

export function createDeadLetterQueue<TData extends object>(definition: QueueDefinition<TData>, connection: Redis) {
  return new Queue<DeadLetterJobData<TData>>(definition.deadLetterName, {
    connection,
  })
}

export function createQueueEvents(definition: QueueDefinition, connection: Redis) {
  return new QueueEvents(definition.name, {
    connection,
  })
}

export function createExampleQueue(connection: Redis) {
  return createQueue(exampleQueueDefinition, connection)
}

export function createExampleDeadLetterQueue(connection: Redis) {
  return createDeadLetterQueue(exampleQueueDefinition, connection)
}

export function createExampleQueueEvents(connection: Redis) {
  return createQueueEvents(exampleQueueDefinition, connection)
}

export function createJobOptions(config: AppConfig, jobId: string): JobsOptions {
  return {
    jobId,
    removeOnComplete: config.JOB_REMOVE_ON_COMPLETE,
    removeOnFail: config.JOB_REMOVE_ON_FAIL,
    attempts: config.JOB_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: config.JOB_BACKOFF_DELAY_MS,
    },
  }
}

export const createExampleJobOptions = createJobOptions
