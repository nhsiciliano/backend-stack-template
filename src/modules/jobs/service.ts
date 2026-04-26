import type { FastifyInstance } from 'fastify'
import { createExampleJobOptions } from '../../lib/queue.js'

export async function enqueueExampleJob(app: FastifyInstance, message: string) {
  const exampleJob = await app.prisma.exampleJob.create({
    data: {
      message,
    },
  })

  await app.exampleQueue.add(
    'example-job',
    {
      jobId: exampleJob.id,
      message,
    },
    createExampleJobOptions(app.config, exampleJob.id),
  )

  return exampleJob
}

export async function processExampleJob(app: FastifyInstance, jobId: string, message: string) {
  await app.prisma.exampleJob.update({
    where: { id: jobId },
    data: {
      status: 'PROCESSING',
      attempts: { increment: 1 },
      startedAt: new Date(),
      lastError: null,
    },
  })

  try {
    const result = `Processed: ${message}`

    await app.prisma.exampleJob.update({
      where: { id: jobId },
      data: {
        status: 'READY',
        result,
        completedAt: new Date(),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown job processing error'

    await app.prisma.exampleJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        lastError: message,
      },
    })

    throw error
  }
}
