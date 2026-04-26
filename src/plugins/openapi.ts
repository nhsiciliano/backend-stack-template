import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

const openApiPlugin: FastifyPluginAsync = async (fastify) => {
  if (!fastify.config.ENABLE_API_DOCS) {
    return
  }

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: fastify.config.APP_NAME,
        description: 'Backend Stack Template API',
        version: '0.1.0',
      },
      servers: [
        {
          url: fastify.config.BETTER_AUTH_URL,
        },
      ],
      components: {
        securitySchemes: {
          internalApiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-internal-api-key',
          },
        },
      },
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  })

  fastify.get('/openapi.json', async () => fastify.swagger())
}

export default fp(openApiPlugin, {
  name: 'openapi',
  dependencies: ['config'],
})
