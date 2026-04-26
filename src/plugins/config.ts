import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import type { AppConfig } from '../config/env.js'

const configPlugin: FastifyPluginAsync<{ config: AppConfig }> = async (fastify, options) => {
  fastify.decorate('config', options.config)
}

export default fp(configPlugin, {
  name: 'config',
})
