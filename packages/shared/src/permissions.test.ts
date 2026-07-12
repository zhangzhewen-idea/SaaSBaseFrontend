import { describe, expect, it } from 'vitest'

import type { AuthSession } from './auth'
import { canAccess } from './permissions'

const session: AuthSession = {
  userId: 'user-1',
  displayName: '测试用户',
  role: 'tenant_admin',
  permissions: ['tenant:read'],
}

describe('canAccess', () => {
  it('拒绝空会话', () => {
    expect(canAccess(null, [])).toBe(false)
  })

  it('拥有全部所需权限时允许访问', () => {
    expect(canAccess(session, ['tenant:read'])).toBe(true)
  })

  it('缺少任一所需权限时拒绝访问', () => {
    expect(canAccess(session, ['tenant:read', 'platform:read'])).toBe(false)
  })
})
