import { describe, expect, it } from 'vitest'
import { hasOrganizationRole } from '../../src/lib/security/rbac.js'

describe('rbac helpers', () => {
  it('allows higher organization roles to satisfy lower requirements', () => {
    expect(hasOrganizationRole('OWNER', 'MEMBER')).toBe(true)
    expect(hasOrganizationRole('ADMIN', 'MEMBER')).toBe(true)
    expect(hasOrganizationRole('MEMBER', 'MEMBER')).toBe(true)
  })

  it('rejects lower organization roles for privileged requirements', () => {
    expect(hasOrganizationRole('MEMBER', 'ADMIN')).toBe(false)
    expect(hasOrganizationRole('ADMIN', 'OWNER')).toBe(false)
  })
})
