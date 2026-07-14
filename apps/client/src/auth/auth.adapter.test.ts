import { beforeEach, describe, expect, it } from 'vitest'

import { clearSession, getSession, login } from './auth.adapter'

describe('auth.adapter', () => {
  beforeEach(() => {
    clearSession()
  })

  it('tenant demo account creates a session', async () => {
    const session = await login('tenant', 'demo123')

    expect(session.displayName).toBe('租户用户')
    expect(getSession()).toEqual(session)
  })

  it('rejects invalid credentials', async () => {
    await expect(login('tenant', 'bad')).rejects.toThrow('登录名或密码错误')
  })

  it('clears session', async () => {
    await login('tenant', 'demo123')

    clearSession()

    expect(getSession()).toBeNull()
  })
})
