import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from './auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('平台管理员登录后建立内存会话', async () => {
    const store = useAuthStore()

    await store.login('platform', 'demo123')

    expect(store.isAuthenticated).toBe(true)
    expect(store.session?.displayName).toBe('平台管理员')
    expect(store.session?.permissions).toEqual(['platform:read'])
  })

  it('租户管理员登录后建立内存会话', async () => {
    const store = useAuthStore()

    await store.login('tenant', 'demo123')

    expect(store.isAuthenticated).toBe(true)
    expect(store.session?.displayName).toBe('租户管理员')
    expect(store.session?.permissions).toEqual(['tenant:read'])
  })

  it('退出后清空会话', async () => {
    const store = useAuthStore()

    await store.login('platform', 'demo123')
    store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(store.session).toBeNull()
  })

  it('无效账号抛出中文错误', async () => {
    const store = useAuthStore()

    await expect(store.login('platform', 'wrong')).rejects.toThrow('登录名或密码错误')
  })
})
