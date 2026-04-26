import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { requireInternalApiKey } from '../../lib/security/internal-auth.js'
import { enqueueExampleJob } from './service.js'

const internalHeadersSchema = Type.Object({
  'x-internal-api-key': Type.String(),
})

const internalErrorSchema = Type.Object({
  message: Type.String(),
})

const jobResponseSchema = Type.Object({
  id: Type.String(),
  message: Type.String(),
  status: Type.String(),
  result: Type.Union([Type.String(), Type.Null()]),
  attempts: Type.Number(),
  lastError: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})

function normalizeJobCounts(counts: Record<string, number>) {
  return {
    waiting: counts.waiting ?? 0,
    active: counts.active ?? 0,
    completed: counts.completed ?? 0,
    failed: counts.failed ?? 0,
    delayed: counts.delayed ?? 0,
    paused: counts.paused ?? 0,
  }
}

const jobsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post(
    '/jobs/example',
    {
      schema: {
        tags: ['jobs'],
        body: Type.Object({
          message: Type.String({ minLength: 1, maxLength: 500 }),
        }),
        response: {
          202: jobResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const job = await enqueueExampleJob(fastify, request.body.message)
      reply.status(202)

      return {
        ...job,
        status: job.status,
        result: job.result,
        lastError: job.lastError,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      }
    },
  )

  fastify.get(
    '/jobs/:id',
    {
      schema: {
        tags: ['jobs'],
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: jobResponseSchema,
          404: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const job = await fastify.prisma.exampleJob.findUnique({
        where: { id: request.params.id },
      })

      if (!job) {
        reply.status(404)
        return { message: 'Job not found' }
      }

      return {
        ...job,
        status: job.status,
        result: job.result,
        lastError: job.lastError,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      }
    },
  )

  fastify.get(
    '/internal/jobs/queues',
    {
      schema: {
        tags: ['internal'],
        headers: internalHeadersSchema,
        response: {
          200: Type.Object({
            example: Type.Object({
              waiting: Type.Number(),
              active: Type.Number(),
              completed: Type.Number(),
              failed: Type.Number(),
              delayed: Type.Number(),
              paused: Type.Number(),
            }),
            exampleDeadLetter: Type.Object({
              waiting: Type.Number(),
              active: Type.Number(),
              completed: Type.Number(),
              failed: Type.Number(),
              delayed: Type.Number(),
              paused: Type.Number(),
            }),
          }),
          401: internalErrorSchema,
          503: internalErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

      if (!auth.ok) {
        return auth.body
      }

      const [example, exampleDeadLetter] = await Promise.all([
        fastify.exampleQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
        fastify.exampleDeadLetterQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
      ])

      return {
        example: normalizeJobCounts(example),
        exampleDeadLetter: normalizeJobCounts(exampleDeadLetter),
      }
    },
  )

  fastify.get(
    '/internal/jobs/dlq',
    {
      schema: {
        tags: ['internal'],
        headers: internalHeadersSchema,
        response: {
          200: Type.Object({
            jobs: Type.Array(
              Type.Object({
                id: Type.String(),
                name: Type.String(),
                data: Type.Object({
                  jobId: Type.String(),
                  message: Type.String(),
                  reason: Type.String(),
                  failedAt: Type.String(),
                }),
              }),
            ),
          }),
          401: internalErrorSchema,
          503: internalErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

      if (!auth.ok) {
        return auth.body
      }

      const jobs = await fastify.exampleDeadLetterQueue.getJobs(['waiting', 'delayed', 'failed'], 0, 49, false)

      return {
        jobs: jobs.map((job) => ({
          id: job.id ?? '',
          name: job.name,
          data: job.data,
        })),
      }
    },
  )

  fastify.post(
    '/internal/jobs/dlq/:id/retry',
    {
      schema: {
        tags: ['internal'],
        headers: internalHeadersSchema,
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          202: Type.Object({
            message: Type.String(),
            jobId: Type.String(),
          }),
          401: internalErrorSchema,
          404: internalErrorSchema,
          503: internalErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

      if (!auth.ok) {
        return auth.body
      }

      const deadLetterJob = await fastify.exampleDeadLetterQueue.getJob(request.params.id)

      if (!deadLetterJob) {
        reply.status(404)
        return { message: 'Dead letter job not found' }
      }

      await fastify.exampleQueue.add(
        'example-job-retry',
        {
          jobId: deadLetterJob.data.jobId,
          message: deadLetterJob.data.message,
        },
        {
          jobId: `${deadLetterJob.data.jobId}:retry:${String(Date.now())}`,
          removeOnComplete: fastify.config.JOB_REMOVE_ON_COMPLETE,
          removeOnFail: fastify.config.JOB_REMOVE_ON_FAIL,
          attempts: fastify.config.JOB_ATTEMPTS,
          backoff: {
            type: 'exponential',
            delay: fastify.config.JOB_BACKOFF_DELAY_MS,
          },
        },
      )
      await deadLetterJob.remove()
      reply.status(202)

      return {
        message: 'Dead letter job requeued',
        jobId: deadLetterJob.data.jobId,
      }
    },
  )
}

export default jobsRoutes
