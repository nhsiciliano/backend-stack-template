import { Worker, type Job } from 'bullmq'
import { buildWorkerApp } from './app.js'
import { loadConfig } from './config/env.js'
import {
  EXAMPLE_QUEUE_NAME,
  createExampleDeadLetterQueue,
  createRedisConnection,
  type ExampleJobData,
} from './lib/queue.js'
import { processExampleJob } from './modules/jobs/service.js'

async function startWorker() {
  const config = loadConfig()
  const app = await buildWorkerApp(config)
  const workerConnection = createRedisConnection(config.REDIS_URL)
  const deadLetterConnection = createRedisConnection(config.REDIS_URL)
  const deadLetterQueue = createExampleDeadLetterQueue(deadLetterConnection)

  const worker = new Worker<ExampleJobData>(
    EXAMPLE_QUEUE_NAME,
    async (job) => {
      await processExampleJob(app, job.data.jobId, job.data.message)
    },
    {
      connection: workerConnection,
      concurrency: config.WORKER_CONCURRENCY,
    },
  )

  worker.on('ready', () => {
    app.log.info('Example job worker is ready')
  })

  worker.on('completed', (job) => {
    app.log.info({ jobId: job.id }, 'Example job completed')
  })

  async function handleFailedJob(job: Job<ExampleJobData> | undefined, error: Error) {
    app.log.error({ err: error, jobId: job?.id }, 'Example job failed')

    if (!job?.data?.jobId) {
      return
    }

    await deadLetterQueue.add(
      'example-job-failed',
      {
        jobId: job.data.jobId,
        message: job.data.message,
        reason: error.message,
        failedAt: new Date().toISOString(),
      },
      {
        removeOnComplete: config.DLQ_REMOVE_ON_COMPLETE,
        removeOnFail: config.DLQ_REMOVE_ON_FAIL,
      },
    )
  }

  worker.on('failed', (job, error) => {
    void handleFailedJob(job, error)
  })

  const shutdown = async () => {
    app.log.info('Shutting down example job worker')
    await worker.close()
    await deadLetterQueue.close()
    await deadLetterConnection.quit()
    await workerConnection.quit()
    await app.close()
    process.exit(0)
  }

  process.on('SIGINT', () => {
    void shutdown()
  })

  process.on('SIGTERM', () => {
    void shutdown()
  })
}

void startWorker().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
