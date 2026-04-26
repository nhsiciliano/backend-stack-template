import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { createApiKeySecret, getApiKeyLast4, getApiKeyPrefix, hashApiKey } from '../../lib/security/api-keys.js'
import { requireInternalApiKey } from '../../lib/security/internal-auth.js'
import { writeAuditLog } from '../../lib/security/audit-log.js'

const internalHeadersSchema = Type.Object({
  'x-internal-api-key': Type.String(),
})

const errorSchema = Type.Object({
  message: Type.String(),
})

function toSlug(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

const securityRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post(
    '/internal/organizations',
    {
      schema: {
        tags: ['internal', 'security'],
        headers: internalHeadersSchema,
        body: Type.Object({
          name: Type.String({ minLength: 1, maxLength: 120 }),
          slug: Type.Optional(Type.String({ minLength: 1, maxLength: 120 })),
        }),
        response: {
          201: Type.Object({
            id: Type.String(),
            name: Type.String(),
            slug: Type.String(),
            createdAt: Type.String(),
          }),
          401: errorSchema,
          409: errorSchema,
          503: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

      if (!auth.ok) {
        return auth.body
      }

      const slug = toSlug(request.body.slug ?? request.body.name)
      const existingOrganization = await fastify.prisma.organization.findUnique({ where: { slug } })

      if (existingOrganization) {
        reply.status(409)
        return { message: 'Organization slug already exists' }
      }

      const organization = await fastify.prisma.organization.create({
        data: {
          name: request.body.name,
          slug,
        },
      })
      await writeAuditLog(fastify, {
        organizationId: organization.id,
        actorType: 'internal',
        action: 'organization.created',
        targetType: 'organization',
        targetId: organization.id,
        request,
      })
      reply.status(201)

      return {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        createdAt: organization.createdAt.toISOString(),
      }
    },
  )

  fastify.post(
    '/internal/api-keys',
    {
      schema: {
        tags: ['internal', 'security'],
        headers: internalHeadersSchema,
        body: Type.Object({
          organizationId: Type.String(),
          name: Type.String({ minLength: 1, maxLength: 120 }),
          scopes: Type.Optional(Type.Array(Type.String({ minLength: 1, maxLength: 80 }))),
          expiresAt: Type.Optional(Type.String({ format: 'date-time' })),
        }),
        response: {
          201: Type.Object({
            id: Type.String(),
            organizationId: Type.String(),
            name: Type.String(),
            key: Type.String(),
            prefix: Type.String(),
            last4: Type.String(),
            scopes: Type.Array(Type.String()),
            expiresAt: Type.Union([Type.String(), Type.Null()]),
            createdAt: Type.String(),
          }),
          401: errorSchema,
          404: errorSchema,
          503: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

      if (!auth.ok) {
        return auth.body
      }

      const organization = await fastify.prisma.organization.findUnique({
        where: { id: request.body.organizationId },
      })

      if (!organization) {
        reply.status(404)
        return { message: 'Organization not found' }
      }

      const key = createApiKeySecret()
      const apiKeyData = {
        organizationId: organization.id,
        name: request.body.name,
        prefix: getApiKeyPrefix(key),
        last4: getApiKeyLast4(key),
        keyHash: hashApiKey(key, fastify.config.BETTER_AUTH_SECRET),
        scopes: request.body.scopes ?? [],
        ...(request.body.expiresAt ? { expiresAt: new Date(request.body.expiresAt) } : {}),
      }
      const apiKey = await fastify.prisma.apiKey.create({
        data: apiKeyData,
      })
      await writeAuditLog(fastify, {
        organizationId: organization.id,
        actorType: 'internal',
        action: 'api_key.created',
        targetType: 'api_key',
        targetId: apiKey.id,
        metadata: { name: apiKey.name, scopes: apiKey.scopes },
        request,
      })
      reply.status(201)

      return {
        id: apiKey.id,
        organizationId: apiKey.organizationId,
        name: apiKey.name,
        key,
        prefix: apiKey.prefix,
        last4: apiKey.last4,
        scopes: apiKey.scopes,
        expiresAt: apiKey.expiresAt?.toISOString() ?? null,
        createdAt: apiKey.createdAt.toISOString(),
      }
    },
  )

  fastify.delete(
    '/internal/api-keys/:id',
    {
      schema: {
        tags: ['internal', 'security'],
        headers: internalHeadersSchema,
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: Type.Object({
            message: Type.String(),
            id: Type.String(),
          }),
          401: errorSchema,
          404: errorSchema,
          503: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

      if (!auth.ok) {
        return auth.body
      }

      const apiKey = await fastify.prisma.apiKey.findUnique({ where: { id: request.params.id } })

      if (!apiKey) {
        reply.status(404)
        return { message: 'API key not found' }
      }

      await fastify.prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { revokedAt: new Date() },
      })
      await writeAuditLog(fastify, {
        organizationId: apiKey.organizationId,
        actorType: 'internal',
        action: 'api_key.revoked',
        targetType: 'api_key',
        targetId: apiKey.id,
        request,
      })

      return {
        message: 'API key revoked',
        id: apiKey.id,
      }
    },
  )

  fastify.get(
    '/internal/audit-logs',
    {
      schema: {
        tags: ['internal', 'security'],
        headers: internalHeadersSchema,
        querystring: Type.Object({
          organizationId: Type.Optional(Type.String()),
          limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 50 })),
        }),
        response: {
          200: Type.Object({
            logs: Type.Array(
              Type.Object({
                id: Type.String(),
                organizationId: Type.Union([Type.String(), Type.Null()]),
                userId: Type.Union([Type.String(), Type.Null()]),
                actorType: Type.String(),
                actorId: Type.Union([Type.String(), Type.Null()]),
                action: Type.String(),
                targetType: Type.Union([Type.String(), Type.Null()]),
                targetId: Type.Union([Type.String(), Type.Null()]),
                metadata: Type.Optional(Type.Any()),
                ipAddress: Type.Union([Type.String(), Type.Null()]),
                userAgent: Type.Union([Type.String(), Type.Null()]),
                createdAt: Type.String(),
              }),
            ),
          }),
          401: errorSchema,
          503: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const auth = requireInternalApiKey(fastify, reply, request.headers['x-internal-api-key'])

      if (!auth.ok) {
        return auth.body
      }

      const logs = await fastify.prisma.auditLog.findMany({
        ...(request.query.organizationId ? { where: { organizationId: request.query.organizationId } } : {}),
        orderBy: { createdAt: 'desc' },
        take: request.query.limit ?? 50,
      })

      return {
        logs: logs.map((log) => ({
          id: log.id,
          organizationId: log.organizationId,
          userId: log.userId,
          actorType: log.actorType,
          actorId: log.actorId,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          metadata: log.metadata ?? undefined,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt.toISOString(),
        })),
      }
    },
  )
}

export default securityRoutes
