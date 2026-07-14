export interface ClientTenantProfile {
  tenantId?: string | number
  tenantCode?: string
  tenantName?: string
  adminUsername?: string
  adminDisplayName?: string
  permissions?: string[]
}

interface ApiResponse<TData> {
  success: boolean
  message?: string
  data: TData
}

function resolveBaseUrl(): string {
  return import.meta.env.VITE_CLIENT_API_BASE_URL?.trim() || '/api/v1'
}

export async function fetchTenantProfile(): Promise<ClientTenantProfile> {
  const response = await fetch(`${resolveBaseUrl()}/admin/tenant/profile`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`租户资料加载失败：HTTP ${response.status}`)
  }

  const payload = (await response.json()) as ApiResponse<ClientTenantProfile>

  if (!payload.success) {
    throw new Error(payload.message || '租户资料加载失败')
  }

  return payload.data
}
