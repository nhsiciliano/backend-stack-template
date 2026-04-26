import type { OrganizationRole } from '@prisma/client'

const roleRank: Record<OrganizationRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
}

export function hasOrganizationRole(role: OrganizationRole, minimumRole: OrganizationRole): boolean {
  return roleRank[role] >= roleRank[minimumRole]
}
