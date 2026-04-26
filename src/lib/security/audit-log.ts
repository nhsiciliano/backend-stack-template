import type { Prisma } from '@prisma/client'
import type { FastifyInstance, FastifyRequest } from 'fastify'

export type WriteAuditLogInput = {
  organizationId?: string
  userId?: string
  actorType: 'user' | 'api_key' | 'internal' | 'system'
  actorId?: string
  action: string
  targetType?: string
  targetId?: string
  metadata?: Prisma.InputJsonValue
  request?: FastifyRequest
}

export async function writeAuditLog(app: FastifyInstance, input: WriteAuditLogInput): Promise<void> {
  const userAgent = input.request?.headers['user-agent']
  const data: Prisma.AuditLogUncheckedCreateInput = {
    actorType: input.actorType,
    action: input.action,
  }

  if (input.organizationId) data.organizationId = input.organizationId
  if (input.userId) data.userId = input.userId
  if (input.actorId) data.actorId = input.actorId
  if (input.targetType) data.targetType = input.targetType
  if (input.targetId) data.targetId = input.targetId
  if (input.metadata) data.metadata = input.metadata
  if (input.request?.ip) data.ipAddress = input.request.ip
  if (typeof userAgent === 'string') data.userAgent = userAgent

  await app.prisma.auditLog.create({
    data,
  })
}
