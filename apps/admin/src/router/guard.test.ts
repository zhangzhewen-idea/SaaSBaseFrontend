import { describe, expect, it } from 'vitest'

import type { AuthSession } from '@saasbase/shared'

import { resolveAccess } from './guard'
import { routes } from './routes'

const tenantSession: AuthSession = {
  userId: 'tenant-admin',
  displayName: '租户管理员',
  role: 'tenant-admin',
  permissions: ['tenant:profile:read'],
}

describe('resolveAccess', () => {
  it('未登录访问受保护页面时跳转登录', () => {
    expect(resolveAccess(null, ['tenant:profile:read'], '/dashboard')).toEqual({
      name: 'login',
      query: { redirect: '/dashboard' },
    })
  })

  it('权限不匹配时跳转无权限页', () => {
    expect(resolveAccess(tenantSession, ['tenant:dept:read'], '/departments')).toEqual({
      name: 'forbidden',
    })
  })
})

describe('routes', () => {
  it('保留 dashboard 作为默认落点', () => {
    const rootRoute = routes[0]!
    expect(rootRoute.redirect).toBe('/dashboard')
  })

  it('将平台概览保留为兼容说明页', () => {
    const adminRoot = routes[1]!
    const platformOverview = adminRoot.children?.find(route => route.path === 'platform/overview')

    expect(platformOverview?.meta).toMatchObject({
      title: '平台概览',
      publicAccess: true
    })
    expect(platformOverview?.redirect).toBeUndefined()
  })
})
