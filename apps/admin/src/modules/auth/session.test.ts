import { afterEach, describe, expect, it } from 'vitest'

import { clearCurrentSession, getAccessToken, getAuthorizationHeader, getCurrentSession, setAuthTokens, setCurrentSession } from './session'

afterEach(() => {
  clearCurrentSession()
})

describe('auth session', () => {
  it('starts empty', () => {
    expect(getCurrentSession()).toBeNull()
  })

  it('stores and clears current session', () => {
    setCurrentSession({
      userId: 'u2',
      displayName: '租户成员',
      role: 'tenant-member',
      tenantId: 'tenant-2',
      permissions: []
    })

    expect(getCurrentSession()?.userId).toBe('u2')

    clearCurrentSession()
    expect(getCurrentSession()).toBeNull()
  })

  it('tracks authorization header from access token', () => {
    setAuthTokens('access-token', 'refresh-token')

    expect(getAccessToken()).toBe('access-token')
    expect(getAuthorizationHeader()).toEqual({ Authorization: 'Bearer access-token' })
  })
})
