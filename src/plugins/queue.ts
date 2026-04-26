import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import {
  createExampleDeadLetterQueue,
  createExampleQueue,
  createExampleQueueEvents,
  createRedisConnection,
} from '../lib/queue.js'

const queuePlugin: FastifyPluginAsync = async (fastify) => {
  const queueConnection = createRedisConnection(fastify.config.REDIS_URL)
  const eventsConnection = createRedisConnection(fastify.config.REDIS_URL)
  const deadLetterConnection = createRedisConnection(fastify.config.REDIS_URL)

  const exampleQueue = createExampleQueue(queueConnection)
  const exampleQueueEvents = createExampleQueueEvents(eventsConnection)
  const exampleDeadLetterQueue = createExampleDeadLetterQueue(deadLetterConnection)

  await exampleQueueEvents.waitUntilReady()

  fastify.decorate('redis', queueConnection)
  fastify.decorate('exampleQueue', exampleQueue)
  fastify.decorate('exampleQueueEvents', exampleQueueEvents)
  fastify.decorate('exampleDeadLetterQueue', exampleDeadLetterQueue)

  fastify.addHook('onClose', async () => {
    await exampleQueueEvents.close()
    await exampleDeadLetterQueue.close()
    await exampleQueue.close()
    await deadLetterConnection.quit()
    await eventsConnection.quit()
    await queueConnection.quit()
  })
}

export default fp(queuePlugin, {
  name: 'queue',
  dependencies: ['config', 'prisma'],
})
