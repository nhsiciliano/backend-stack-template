import type { FastifyInstance } from 'fastify'
import authRoutes from './modules/auth/routes.js'
import devRoutes from './modules/dev/routes.js'
import healthRoutes from './modules/health/routes.js'
import jobsRoutes from './modules/jobs/routes.js'
import rootRoutes from './modules/root/routes.js'
import securityRoutes from './modules/security/routes.js'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes)
  await app.register(rootRoutes)
  await app.register(healthRoutes)
  await app.register(jobsRoutes)

  if (app.config.ENABLE_INTERNAL_ROUTES) {
    await app.register(securityRoutes)
  }

  if (app.config.ENABLE_DEV_ROUTES) {
    await app.register(devRoutes)
  }
}
