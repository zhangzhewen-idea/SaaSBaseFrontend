import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('./auth.service', () => ({
  login: vi.fn(async () => ({
    session: {
      userId: 'u1',
      displayName: '租户管理员',
      role: 'tenant-admin',
      tenantId: 'tenant-1',
      permissions: ['tenant:profile:read']
    },
    tenantName: 'SaaSBase'
  })),
  logout: vi.fn(async () => undefined)
}))

import { useAuthStore } from './auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('登录后建立会话', async () => {
    const store = useAuthStore()

    await store.login('tenant-a', 'alice', 'pass123')

    expect(store.isAuthenticated).toBe(true)
    expect(store.session?.displayName).toBe('租户管理员')
    expect(store.session?.permissions).toEqual(['tenant:profile:read'])
  })

  it('退出后清空会话', async () => {
    const store = useAuthStore()

    await store.login('tenant-a', 'alice', 'pass123')
    await store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(store.session).toBeNull()
  })
})
