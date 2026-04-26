import Fastify from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { AppConfig } from './config/env.js'
import { registerCorePlugins, registerHttpPlugins } from './plugins/index.js'
import { registerRoutes } from './routes.js'

function createAppInstance(config: AppConfig) {
  return Fastify({
    bodyLimit: config.BODY_LIMIT_BYTES,
    requestIdHeader: 'x-request-id',
    logger: {
      level: config.LOG_LEVEL,
      redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.secret', '*.apiKey'],
    },
  }).withTypeProvider<TypeBoxTypeProvider>()
}

export async function buildHttpApp(config: AppConfig) {
  const app = createAppInstance(config)

  await registerCorePlugins(app, config)
  await registerHttpPlugins(app)
  await registerRoutes(app)

  return app
}

export async function buildWorkerApp(config: AppConfig) {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.secret', '*.apiKey'],
    },
  }).withTypeProvider<TypeBoxTypeProvider>()

  await registerCorePlugins(app, config)

  return app
}

export const buildApp = buildHttpApp
