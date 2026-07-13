import type { RouteLocationNormalized } from 'vue-router'

import { resolveAuthRedirect } from '../modules/auth/auth.guard'

export function resolveRedirect(to: RouteLocationNormalized): string | null {
  return resolveAuthRedirect(to)
}
