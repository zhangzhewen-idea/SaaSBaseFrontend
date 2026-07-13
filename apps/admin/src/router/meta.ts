import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiredPermission?: string | readonly string[]
    publicAccess?: boolean
  }
}

export {}
