import type { ApiRuntime } from '@saasbase/api-client'

function normalizeBaseUrl(value: string | undefined): string | undefined {
  const nextValue = value?.trim()
  return nextValue ? nextValue : undefined
}

export function createAdminApiRuntime(): ApiRuntime {
  return {
    baseUrl: import.meta.env.DEV ? '/api/v1' : normalizeBaseUrl(import.meta.env.VITE_ADMIN_API_BASE_URL)
  }
}
