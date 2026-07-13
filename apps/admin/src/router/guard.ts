import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { canAccess } from '@saasbase/shared'

import type { AuthSession } from '@saasbase/shared'

type AccessResult = true | RouteLocationRaw

export function resolveAccess(
  session: AuthSession | null,
  required: AuthSession extends never ? never : import('@saasbase/shared').Permission[],
  fullPath: string,
): AccessResult {
  if (session === null) {
    return { name: 'login', query: { redirect: fullPath } }
  }

  return canAccess(session, required) ? true : { name: 'forbidden' }
}

export function createRouteGuard(getSession: () => AuthSession | null) {
  return (to: RouteLocationNormalized) => {
    if (to.meta.requiresAuth !== true) {
      return true
    }

    return resolveAccess(getSession(), to.meta.permissions ?? [], to.fullPath)
  }
}
