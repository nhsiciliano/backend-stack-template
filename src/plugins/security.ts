import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { createRedisConnection } from '../lib/queue.js'

const securityPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id)
  })

  if (fastify.config.ENABLE_SECURITY_HEADERS) {
    await fastify.register(helmet)
  }

  const rateLimitRedis = createRedisConnection(fastify.config.REDIS_URL)

  await fastify.register(rateLimit, {
    global: true,
    max: fastify.config.RATE_LIMIT_MAX,
    timeWindow: fastify.config.RATE_LIMIT_WINDOW,
    redis: rateLimitRedis,
  })

  fastify.addHook('onClose', async () => {
    await rateLimitRedis.quit()
  })
}

export default fp(securityPlugin, {
  name: 'security',
  dependencies: ['config'],
})
