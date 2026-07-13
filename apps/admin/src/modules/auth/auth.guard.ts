import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { hasPermission, getCurrentSession } from './session'

export function resolveAuthRedirect(to: RouteLocationNormalized): string | null {
  if (to.meta.publicAccess || to.path === '/login' || to.path === '/forbidden') {
    return null
  }

  if (!getCurrentSession()) {
    return '/login?redirect=' + encodeURIComponent(to.fullPath)
  }

  const requiredPermission = to.meta.requiredPermission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return '/forbidden'
  }

  return null
}

export function applyAuthGuard(to: RouteLocationNormalized, next: NavigationGuardNext): void {
  const redirect = resolveAuthRedirect(to)
  if (redirect) {
    next(redirect)
    return
  }

  next()
}
