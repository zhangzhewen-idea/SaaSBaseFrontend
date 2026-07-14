import { describe, expect, it } from 'vitest'

import type { AuthSession } from '@saasbase/shared'

import { resolveAccess } from './guard'

const tenantSession: AuthSession = {
  userId: 'tenant-admin',
  displayName: '租户管理员',
  role: 'tenant_admin',
  permissions: ['tenant:read'],
}

describe('resolveAccess', () => {
  it('未登录访问受保护页面时跳转登录', () => {
    expect(resolveAccess(null, ['platform:read'], '/platform/overview')).toEqual({
      name: 'login',
      query: { redirect: '/platform/overview' },
    })
  })

  it('权限不匹配时跳转无权限页', () => {
    expect(resolveAccess(tenantSession, ['platform:read'], '/platform/overview')).toEqual({
      name: 'forbidden',
    })
  })
})
