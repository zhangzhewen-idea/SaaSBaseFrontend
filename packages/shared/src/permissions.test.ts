import { describe, expect, it } from 'vitest'

import { canAccess } from './permissions'

describe('canAccess', () => {
  it('allows a null session when no permission is required', () => {
    expect(canAccess(null, null)).toBe(true)
    expect(canAccess(undefined, undefined)).toBe(true)
    expect(canAccess(null, [])).toBe(true)
  })

  it('denies a null session when permission is required', () => {
    expect(canAccess(null, 'platform-dashboard:view')).toBe(false)
    expect(canAccess(undefined, ['platform-dashboard:view'])).toBe(false)
  })

  it('allows matching permissions after normalization', () => {
    const session = {
      userId: 'u1',
      role: 'platform-admin' as const,
      permissions: [' Platform_Dashboard:View ']
    }

    expect(canAccess(session, 'platform_dashboard:view')).toBe(true)
  })

  it('denies mismatched permissions', () => {
    const session = {
      userId: 'u1',
      role: 'tenant-admin' as const,
      permissions: ['tenant-dashboard:view']
    }

    expect(canAccess(session, 'platform-dashboard:view')).toBe(false)
  })
})
