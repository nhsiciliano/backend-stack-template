import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { enqueueExampleJob } from './service.js'

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
}

export default jobsRoutes
