import { describe, expect, it } from 'vitest'

import type { AuthSession } from '@saasbase/shared'

import { resolveAccess } from './guard'

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
