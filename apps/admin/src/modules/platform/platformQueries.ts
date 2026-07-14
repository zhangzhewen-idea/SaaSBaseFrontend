import type { PlatformTenantQuery } from '@/api'

export function createDefaultPlatformTenantQuery(): PlatformTenantQuery {
  return {
    pageNo: 1,
    pageSize: 20,
    keyword: '',
    status: undefined
  }
}
