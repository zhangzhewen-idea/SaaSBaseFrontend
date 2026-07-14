import { describe, expect, it } from 'vitest'

import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { resolvePageTitle, syncDocumentTitle } from './routeGuards'

function createRoute(title?: string): RouteLocationNormalizedLoaded {
  return {
    fullPath: '/dashboard',
    meta: title ? { title } : {},
    hash: '',
    query: {},
    params: {},
    matched: [],
    redirectedFrom: undefined,
    name: undefined,
    path: '/dashboard',
    props: {},
    customProps: {},
    href: '/dashboard',
    record: undefined,
    children: [],
    leaveGuards: new Set(),
    updateGuards: new Set(),
    enterCallbacks: {},
    components: {}
  } as RouteLocationNormalizedLoaded
}

describe('resolvePageTitle', () => {
  it('会把路由标题拼接为浏览器标题', () => {
    expect(resolvePageTitle(createRoute('用户管理'))).toBe('用户管理 - SaaSBase Admin')
  })

  it('没有路由标题时使用默认标题', () => {
    expect(resolvePageTitle(createRoute())).toBe('SaaSBase Admin')
  })

  it('会同步浏览器标题', () => {
    document.title = '旧标题'

    syncDocumentTitle(createRoute('用户管理'))

    expect(document.title).toBe('用户管理 - SaaSBase Admin')
  })
})
