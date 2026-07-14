import type { ApiRuntime } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export interface LoginRequest {
  tenantCode: string
  username: string
  password: string
}

export interface LoginResponse {
  tokenType: string
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
}

export interface TenantProfileResponse {
  tenantId?: string | number
  tenantCode?: string
  tenantName?: string
  adminUsername?: string
  adminDisplayName?: string
  permissions?: string[]
}

export interface JwtClaims {
  userId?: string | number
  tenantId?: string | number
  username?: string
  displayName?: string
  role?: string
  permissions?: string[]
  authorities?: string[]
  tenantCode?: string
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return atob(padded)
}

export function decodeJwtClaims(token: string): JwtClaims | null {
  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const payload = parts[1]
    if (!payload) {
      return null
    }

    return JSON.parse(decodeBase64Url(payload)) as JwtClaims
  } catch {
    return null
  }
}

export function createAuthApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    login(request: LoginRequest) {
      return http.post<LoginResponse>('/api/v1/auth/login', request)
    },
    refresh(refreshToken: string) {
      return http.post<LoginResponse>('/api/v1/auth/refresh', { refreshToken })
    },
    logout(refreshToken: string) {
      return http.post<void>('/api/v1/auth/logout', { refreshToken })
    },
    tenantProfile() {
      return http.get<TenantProfileResponse>('/api/v1/admin/tenant/profile')
    }
  }
}
