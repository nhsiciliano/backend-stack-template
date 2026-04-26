import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { requireInternalApiKey } from '../../lib/security/internal-auth.js'

const errorSchema = Type.Object({
  message: Type.String(),
})

const devRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/dev/config',
    {
      schema: {
        tags: ['dev'],
        headers: Type.Object({
          'x-internal-api-key': Type.Optional(Type.String()),
        }),
        response: {
          200: Type.Object({
            appName: Type.String(),
            corsOrigin: Type.String(),
            devRoutesEnabled: Type.Boolean(),
          }),
          401: errorSchema,
          503: errorSchema,
        },
      },
    },
    async (request, reply) => {
      if (fastify.config.REQUIRE_DEV_ROUTE_AUTH) {
        const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

        if (!auth.ok) {
          return auth.body
        }
      }

      return {
        appName: fastify.config.APP_NAME,
        corsOrigin: fastify.config.CORS_ORIGIN,
        devRoutesEnabled: fastify.config.ENABLE_DEV_ROUTES,
      }
    },
  )
}

export default devRoutes
