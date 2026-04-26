import { Worker } from 'bullmq'
import { buildApp } from './app.js'
import { loadConfig } from './config/env.js'
import { EXAMPLE_QUEUE_NAME, createExampleDeadLetterQueue, createRedisConnection, type ExampleJobData } from './lib/queue.js'
import { processExampleJob } from './modules/jobs/service.js'

async function startWorker() {
  const config = loadConfig()
  const app = await buildApp(config)
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
      concurrency: 1,
    },
  )

  worker.on('ready', () => {
    app.log.info('Example job worker is ready')
  })

  worker.on('completed', (job) => {
    app.log.info({ jobId: job.id }, 'Example job completed')
  })

  worker.on('failed', async (job, error) => {
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
      },
      {
        removeOnComplete: 500,
        removeOnFail: 500,
      },
    )
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

void startWorker().catch((error) => {
  console.error(error)
  process.exit(1)
})
