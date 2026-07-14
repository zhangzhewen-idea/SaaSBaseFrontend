import type { Permission } from '@saasbase/shared'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    permissions?: Permission[]
  }
}

export {}
