import type { PlatformTenantQuery } from '@/api/platform'

export function createDefaultPlatformTenantQuery(): PlatformTenantQuery {
  return {
    pageNo: 1,
    pageSize: 20,
    keyword: '',
    status: undefined
  }
}
