import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearSession, getSession, login } from './auth.adapter'
import { ensureClientSession } from './auth.guard'

describe('client auth guard', () => {
  beforeEach(() => {
    clearSession()
  })

  it('returns false when no session exists', () => {
    expect(ensureClientSession()).toBe(false)
  })

  it('returns true after login', async () => {
    await login('tenant', 'demo123')
    expect(ensureClientSession()).toBe(true)
    expect(getSession()).not.toBeNull()
  })
})
