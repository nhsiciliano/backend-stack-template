import Fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { AppConfig } from './config/env.js'
import { registerPlugins } from './plugins/index.js'
import { registerRoutes } from './routes.js'

export async function buildApp(config: AppConfig) {
  const app = Fastify({
    bodyLimit: config.BODY_LIMIT_BYTES,
    requestIdHeader: 'x-request-id',
    logger: {
      level: config.LOG_LEVEL,
      redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.secret', '*.apiKey'],
    },
  }).withTypeProvider<TypeBoxTypeProvider>()

  await registerPlugins(app, config)
  await registerRoutes(app)

  return app
}
