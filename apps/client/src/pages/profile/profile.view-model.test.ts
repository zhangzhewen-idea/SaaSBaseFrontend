import { describe, expect, it } from 'vitest'

import type { AuthSession } from '@saasbase/shared'

import { resolveProfileFieldItems } from './profile.view-model'

const session: AuthSession = {
  userId: 'tenant-demo',
  displayName: '租户用户',
  role: 'tenant-admin',
  permissions: ['tenant:read']
}

describe('profile view model', () => {
  it('falls back to the session when profile data is missing', () => {
    expect(resolveProfileFieldItems(null, session)).toEqual([
      { label: '租户 ID', value: 'tenant-demo' },
      { label: '租户编码', value: '-' },
      { label: '租户名称', value: '租户用户' },
      { label: '管理员账号', value: 'tenant-demo' },
      { label: '管理员显示名', value: '租户用户' },
      { label: '权限数', value: '1 项' }
    ])
  })

  it('prefers profile data when it exists', () => {
    expect(
      resolveProfileFieldItems(
        {
          tenantId: 'tenant-1',
          tenantCode: 'tenant-a',
          tenantName: 'A 公司',
          adminUsername: 'alice',
          adminDisplayName: 'Alice',
          permissions: ['tenant:profile:read']
        },
        session
      )
    ).toEqual([
      { label: '租户 ID', value: 'tenant-1' },
      { label: '租户编码', value: 'tenant-a' },
      { label: '租户名称', value: 'A 公司' },
      { label: '管理员账号', value: 'alice' },
      { label: '管理员显示名', value: 'Alice' },
      { label: '权限数', value: '1 项' }
    ])
  })
})
