import type { RouteLocationNormalized } from 'vue-router'

import { resolveAuthRedirect } from '../modules/auth/auth.guard'

const DEFAULT_BROWSER_TITLE = 'SaaSBase Admin'

export function resolveRedirect(to: RouteLocationNormalized): string | null {
  return resolveAuthRedirect(to)
}

export function resolvePageTitle(to: RouteLocationNormalized): string {
  const routeTitle = typeof to.meta.title === 'string' ? to.meta.title.trim() : ''

  if (routeTitle === '') {
    return DEFAULT_BROWSER_TITLE
  }

  return `${routeTitle} - ${DEFAULT_BROWSER_TITLE}`
}

export function syncDocumentTitle(to: RouteLocationNormalized): void {
  if (typeof document === 'undefined') {
    return
  }

  document.title = resolvePageTitle(to)
}
