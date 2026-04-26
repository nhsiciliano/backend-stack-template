import cors from '@fastify/cors'
import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

function parseOrigins(originConfig: string): string | string[] {
  const origins = originConfig
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (origins.length === 1) {
    return origins[0] ?? originConfig
  }

  return origins
}

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: parseOrigins(fastify.config.CORS_ORIGIN),
    credentials: true,
  })
}

export default fp(corsPlugin, {
  name: 'cors',
  dependencies: ['config'],
})
