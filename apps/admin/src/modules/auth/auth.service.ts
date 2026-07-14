import type { AuthSession } from '@saasbase/shared'

import { createAdminApiRuntime } from '@/api/runtime'
import { createAuthApi, decodeJwtClaims, type TenantProfileResponse } from '@/api/auth'

import { clearCurrentSession, getRefreshToken, restoreSessionFromClaims, setAuthTokens } from './session'

export interface LoginInput {
  tenantCode: string
  username: string
  password: string
}

export interface AuthSnapshot {
  session: AuthSession
  tenantName: string
}

const authApi = createAuthApi(createAdminApiRuntime())

function resolveTenantName(profile: TenantProfileResponse | null): string {
  return profile?.tenantName ?? profile?.adminDisplayName ?? '未知租户'
}

export async function login(input: LoginInput): Promise<AuthSnapshot> {
  const response = await authApi.login(input)
  setAuthTokens(response.accessToken, response.refreshToken)

  const claims = decodeJwtClaims(response.accessToken)
  const session = restoreSessionFromClaims(claims)
  const profile = await authApi.tenantProfile().catch(() => null)

  return {
    session,
    tenantName: resolveTenantName(profile)
  }
}

export async function refreshSession(): Promise<AuthSnapshot | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  const response = await authApi.refresh(refreshToken)
  setAuthTokens(response.accessToken, response.refreshToken)

  const claims = decodeJwtClaims(response.accessToken)
  const session = restoreSessionFromClaims(claims)
  const profile = await authApi.tenantProfile().catch(() => null)

  return {
    session,
    tenantName: resolveTenantName(profile)
  }
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    await authApi.logout(refreshToken).catch(() => undefined)
  }

  clearCurrentSession()
}
