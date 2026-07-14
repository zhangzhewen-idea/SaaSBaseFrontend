import type { PageResponse, ApiRuntime } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export interface PlatformTenantStatus {
  active: boolean
}

export interface PlatformTenantQuery {
  pageNo: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'disabled'
}

export interface PlatformTenantSummary {
  id: string
  tenantCode: string
  tenantName: string
  adminUsername: string
  adminDisplayName?: string
  status: 'active' | 'disabled'
  operatorId?: string
  updatedAt: string
}

export interface PlatformTenantDetail extends PlatformTenantSummary {
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  remark?: string
}

export interface PlatformTenantPayload {
  tenantCode: string
  tenantName: string
  adminUsername: string
  adminDisplayName?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  remark?: string
}

export function mapPlatformTenantQuery(query: PlatformTenantQuery): Record<string, string | number | undefined> {
  return {
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    keyword: query.keyword?.trim() || undefined,
    status: query.status
  }
}

export function createPlatformApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    list(query: PlatformTenantQuery) {
      return http.get<PageResponse<PlatformTenantSummary>>('/api/v1/platform/tenants', mapPlatformTenantQuery(query))
    },
    detail(id: string) {
      return http.get<PlatformTenantDetail>(`/api/v1/platform/tenants/${id}`)
    },
    create(payload: PlatformTenantPayload & { operatorId: string }) {
      const { operatorId, ...body } = payload
      return http.post<PlatformTenantDetail>(`/api/v1/platform/tenants?operatorId=${encodeURIComponent(operatorId)}`, body)
    },
    update(id: string, payload: PlatformTenantPayload & { operatorId: string }) {
      const { operatorId, ...body } = payload
      return http.put<PlatformTenantDetail>(`/api/v1/platform/tenants/${id}?operatorId=${encodeURIComponent(operatorId)}`, body)
    },
    updateStatus(id: string, payload: PlatformTenantStatus & { operatorId: string }) {
      return http.post<PlatformTenantDetail>(
        `/api/v1/platform/tenants/${id}/${payload.active ? 'enable' : 'disable'}?operatorId=${encodeURIComponent(payload.operatorId)}`
      )
    }
  }
}
