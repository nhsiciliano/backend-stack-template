import type { FastifyInstance } from 'fastify'
import type { AppConfig } from '../config/env.js'
import configPlugin from './config.js'
import corsPlugin from './cors.js'
import openApiPlugin from './openapi.js'
import prismaPlugin from './prisma.js'
import queuePlugin from './queue.js'
import securityPlugin from './security.js'

export async function registerCorePlugins(app: FastifyInstance, config: AppConfig): Promise<void> {
  await app.register(configPlugin, { config })
  await app.register(prismaPlugin)
}

export async function registerHttpPlugins(app: FastifyInstance): Promise<void> {
  await app.register(securityPlugin)
  await app.register(corsPlugin)
  await app.register(openApiPlugin)
  await app.register(queuePlugin)
}

export async function registerPlugins(app: FastifyInstance, config: AppConfig): Promise<void> {
  await registerCorePlugins(app, config)
  await registerHttpPlugins(app)
}
