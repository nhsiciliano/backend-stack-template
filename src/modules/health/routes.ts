import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

const dependencySchema = Type.Object({
  status: Type.Union([Type.Literal('ok'), Type.Literal('error')]),
  error: Type.Optional(Type.String()),
})

async function checkDependency(check: () => Promise<void>) {
  try {
    await check()

    return { status: 'ok' as const }
  } catch (error) {
    return {
      status: 'error' as const,
      error: error instanceof Error ? error.message : 'Unknown dependency error',
    }
  }
}

const healthRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        response: {
          200: Type.Object({
            status: Type.Literal('ok'),
            checks: Type.Object({
              database: dependencySchema,
              redis: dependencySchema,
            }),
          }),
          503: Type.Object({
            status: Type.Literal('error'),
            checks: Type.Object({
              database: dependencySchema,
              redis: dependencySchema,
            }),
          }),
        },
      },
    },
    async (_request, reply) => {
      const [database, redis] = await Promise.all([
        checkDependency(async () => {
          await fastify.prisma.$queryRaw`SELECT 1`
        }),
        checkDependency(async () => {
          await fastify.redis.ping()
        }),
      ])

      const isHealthy = database.status === 'ok' && redis.status === 'ok'

      if (!isHealthy) {
        reply.status(503)
      }

      return {
        status: isHealthy ? ('ok' as const) : ('error' as const),
        checks: {
          database,
          redis,
        },
      }
    },
  )
}

export default healthRoutes
