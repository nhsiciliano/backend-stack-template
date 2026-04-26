import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance, FastifyReply } from 'fastify'

export const internalHeadersSchema = {
  type: 'object',
  required: ['x-internal-api-key'],
  properties: {
    'x-internal-api-key': { type: 'string' },
  },
} as const

export const internalErrorSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string' },
  },
} as const

function safeCompare(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)

  if (valueBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(valueBuffer, expectedBuffer)
}

export function checkInternalApiKey(app: FastifyInstance, apiKey: string | undefined) {
  if (!app.config.INTERNAL_API_KEY) {
    return { authorized: false as const, statusCode: 503 as const, message: 'Internal API key is not configured' }
  }

  if (!apiKey || !safeCompare(apiKey, app.config.INTERNAL_API_KEY)) {
    return { authorized: false as const, statusCode: 401 as const, message: 'Unauthorized' }
  }

  return { authorized: true as const }
}

export function requireInternalApiKey(app: FastifyInstance, reply: FastifyReply, apiKey: string | undefined) {
  const result = checkInternalApiKey(app, apiKey)

  if (!result.authorized) {
    reply.status(result.statusCode)
    return { ok: false as const, body: { message: result.message } }
  }

  return { ok: true as const }
}
