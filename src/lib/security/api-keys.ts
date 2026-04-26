import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { FastifyInstance } from 'fastify'

const API_KEY_PREFIX = 'bst'

export function createApiKeySecret(): string {
  return `${API_KEY_PREFIX}_${randomBytes(32).toString('base64url')}`
}

export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 12)
}

export function getApiKeyLast4(apiKey: string): string {
  return apiKey.slice(-4)
}

export function hashApiKey(apiKey: string, pepper: string): string {
  return createHash('sha256').update(`${pepper}:${apiKey}`).digest('hex')
}

export function compareHashes(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)

  if (valueBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(valueBuffer, expectedBuffer)
}

export async function authenticateApiKey(app: FastifyInstance, apiKey: string) {
  const keyHash = hashApiKey(apiKey, app.config.BETTER_AUTH_SECRET)
  const apiKeyRecord = await app.prisma.apiKey.findUnique({
    where: { keyHash },
    include: { organization: true },
  })

  if (!apiKeyRecord || apiKeyRecord.revokedAt) {
    return null
  }

  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt <= new Date()) {
    return null
  }

  if (!compareHashes(keyHash, apiKeyRecord.keyHash)) {
    return null
  }

  await app.prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKeyRecord
}
