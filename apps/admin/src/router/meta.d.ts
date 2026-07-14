import type { Permission } from '@saasbase/shared'

declare module 'vue-router' {
  interface RouteMeta {
    requiredPermission?: Permission | readonly Permission[]
    publicAccess?: boolean
  }
}

export {}
