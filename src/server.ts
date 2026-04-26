import { buildHttpApp } from './app.js'
import { loadConfig } from './config/env.js'

async function startServer() {
  const config = loadConfig()
  const app = await buildHttpApp(config)

  const shutdown = async () => {
    app.log.info('Shutting down HTTP server')
    await app.close()
    process.exit(0)
  }

  process.on('SIGINT', () => {
    void shutdown()
  })

  process.on('SIGTERM', () => {
    void shutdown()
  })

  await app.listen({ host: config.HOST, port: config.PORT })
}

void startServer().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
