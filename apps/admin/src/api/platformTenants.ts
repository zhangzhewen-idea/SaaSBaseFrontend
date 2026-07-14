import type { ApiRuntime, PageResponse } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export type PlatformTenantStatus = 'enabled' | 'disabled'

export interface PlatformTenantListQuery {
  pageNo: number
  pageSize: number
  tenantName?: string
  tenantCode?: string
  status?: PlatformTenantStatus
}

export interface PlatformTenantSummary {
  id: string
  tenantName: string
  tenantCode: string
  status: PlatformTenantStatus
  updatedAt: string
}

export interface PlatformTenantDetail extends PlatformTenantSummary {
  remark?: string
  operatorId?: string
}

export interface PlatformTenantPayload {
  tenantName: string
  tenantCode: string
  remark?: string
}

export interface PlatformTenantWritePayload extends PlatformTenantPayload {
  operatorId: string
}

export interface PlatformTenantOperatorPayload {
  operatorId: string
}

function normalizeQueryValue(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

export function mapPlatformTenantListQuery(query: PlatformTenantListQuery): Record<string, string | number | boolean | undefined> {
  return {
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    tenantName: normalizeQueryValue(query.tenantName),
    tenantCode: normalizeQueryValue(query.tenantCode),
    status: query.status
  }
}

function withOperatorId(path: string, operatorId: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}operatorId=${encodeURIComponent(operatorId)}`
}

export function createPlatformTenantsApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    list(query: PlatformTenantListQuery) {
      return http.get<PageResponse<PlatformTenantSummary>>('/api/v1/platform/tenants', mapPlatformTenantListQuery(query))
    },
    detail(id: string) {
      return http.get<PlatformTenantDetail>(`/api/v1/platform/tenants/${id}`)
    },
    create(payload: PlatformTenantWritePayload) {
      return http.post<PlatformTenantDetail>(withOperatorId('/api/v1/platform/tenants', payload.operatorId), {
        tenantName: payload.tenantName,
        tenantCode: payload.tenantCode,
        remark: payload.remark
      })
    },
    update(id: string, payload: PlatformTenantWritePayload) {
      return http.put<PlatformTenantDetail>(withOperatorId(`/api/v1/platform/tenants/${id}`, payload.operatorId), {
        tenantName: payload.tenantName,
        tenantCode: payload.tenantCode,
        remark: payload.remark
      })
    },
    enable(id: string, payload: PlatformTenantOperatorPayload) {
      return http.post<PlatformTenantDetail>(withOperatorId(`/api/v1/platform/tenants/${id}/enable`, payload.operatorId))
    },
    disable(id: string, payload: PlatformTenantOperatorPayload) {
      return http.post<PlatformTenantDetail>(withOperatorId(`/api/v1/platform/tenants/${id}/disable`, payload.operatorId))
    }
  }
}
