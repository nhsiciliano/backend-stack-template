import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

const devRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/dev/config',
    {
      schema: {
        tags: ['dev'],
        response: {
          200: Type.Object({
            appName: Type.String(),
            corsOrigin: Type.String(),
            devRoutesEnabled: Type.Boolean(),
          }),
        },
      },
    },
    async () => {
      return {
        appName: fastify.config.APP_NAME,
        corsOrigin: fastify.config.CORS_ORIGIN,
        devRoutesEnabled: fastify.config.ENABLE_DEV_ROUTES,
      }
    },
  )
}

export default devRoutes
