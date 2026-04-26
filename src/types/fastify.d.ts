import type { PrismaClient } from '@prisma/client'
import type { Queue, QueueEvents } from 'bullmq'
import type { Redis } from 'ioredis'
import type { AppConfig } from '../config/env.js'
import type { DeadLetterJobData, ExampleJobData } from '../lib/queue.js'

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig
    prisma: PrismaClient
    redis: Redis
    exampleQueue: Queue<ExampleJobData>
    exampleQueueEvents: QueueEvents
    exampleDeadLetterQueue: Queue<DeadLetterJobData<ExampleJobData>>
  }
}

export {}
