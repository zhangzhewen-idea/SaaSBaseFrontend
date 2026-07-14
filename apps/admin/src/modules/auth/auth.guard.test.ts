import { describe, expect, it } from 'vitest'

import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { clearCurrentSession, restoreDemoSession, setCurrentSession } from './session'
import { resolveAuthRedirect } from './auth.guard'

function createRoute(fullPath: string, requiredPermission?: string): RouteLocationNormalizedLoaded {
  return {
    fullPath,
    meta: requiredPermission ? { requiredPermission } : {},
    hash: '',
    query: {},
    params: {},
    matched: [],
    redirectedFrom: undefined,
    name: undefined,
    path: fullPath,
    props: {},
    customProps: {},
    href: fullPath,
    record: undefined,
    children: [],
    leaveGuards: new Set(),
    updateGuards: new Set(),
    enterCallbacks: {},
    components: {}
  } as RouteLocationNormalizedLoaded
}

describe('auth guard', () => {
  it('redirects unauthenticated users to login', () => {
    clearCurrentSession()
    expect(resolveAuthRedirect(createRoute('/dashboard'))).toBe('/login?redirect=%2Fdashboard')
  })

  it('allows public routes without a session', () => {
    clearCurrentSession()
    expect(resolveAuthRedirect(createRoute('/login'))).toBeNull()
  })

  it('allows demo session to enter permitted routes', () => {
    restoreDemoSession()
    expect(resolveAuthRedirect(createRoute('/dashboard', 'tenant-dashboard:view'))).toBeNull()
  })

  it('redirects to forbidden when permission is missing', () => {
    setCurrentSession({
      userId: 'u1',
      displayName: '租户成员',
      role: 'tenant-member',
      tenantId: 'tenant-1',
      permissions: ['tenant-user:view']
    })

    expect(resolveAuthRedirect(createRoute('/dashboard', 'tenant-department:view'))).toBe('/forbidden')
  })
})
