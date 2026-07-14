import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { canAccess } from '@saasbase/shared'

import type { AuthSession, RequiredPermission } from '@saasbase/shared'

type AccessResult = true | RouteLocationRaw

export function resolveAccess(
  session: AuthSession | null,
  required: RequiredPermission | null | undefined,
  fullPath: string,
): AccessResult {
  if (session === null) {
    return { name: 'login', query: { redirect: fullPath } }
  }

  return canAccess(session, required) ? true : { name: 'forbidden' }
}

export function createRouteGuard(getSession: () => AuthSession | null) {
  return (to: RouteLocationNormalized) => {
    if (to.meta.publicAccess === true) {
      return true
    }

    return resolveAccess(getSession(), to.meta.requiredPermission, to.fullPath)
  }
}
