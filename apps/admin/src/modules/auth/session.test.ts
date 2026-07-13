import { afterEach, describe, expect, it } from 'vitest'

import { clearCurrentSession, getDemoSession, getCurrentSession, restoreDemoSession, setCurrentSession } from './session'

afterEach(() => {
  restoreDemoSession()
})

describe('auth session', () => {
  it('keeps a demo session by default', () => {
    expect(getCurrentSession()).toEqual(getDemoSession())
  })

  it('can clear and restore session', () => {
    clearCurrentSession()
    expect(getCurrentSession()).toBeNull()

    restoreDemoSession()
    expect(getCurrentSession()).toEqual(getDemoSession())
  })

  it('can replace the current session', () => {
    setCurrentSession({
      userId: 'u2',
      role: 'tenant-member',
      tenantId: 'tenant-2',
      permissions: []
    })

    expect(getCurrentSession()?.userId).toBe('u2')
  })
})
