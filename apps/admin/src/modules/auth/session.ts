import type { AuthSession, Permission } from '@saasbase/shared'
import { canAccess } from '@saasbase/shared'

import type { JwtClaims } from '@/api/auth'

const SESSION_STORAGE_KEY = 'saasbase.admin.auth'

interface AuthState {
  session: AuthSession | null
  accessToken: string | null
  refreshToken: string | null
}

const fallbackState: AuthState = {
  session: null,
  accessToken: null,
  refreshToken: null
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function readStoredState(): AuthState {
  if (!isBrowser()) {
    return fallbackState
  }

  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return fallbackState
  }

  try {
    return JSON.parse(raw) as AuthState
  } catch {
    return fallbackState
  }
}

function writeStoredState(state: AuthState): void {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state))
}

function clearStoredState(): void {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

function normalizeClaims(claims: JwtClaims | null): Partial<AuthSession> {
  if (!claims) {
    return {}
  }

  const permissions = claims.permissions ?? claims.authorities ?? []

  return {
    userId: String(claims.userId ?? claims.username ?? 'unknown'),
    displayName: claims.displayName ?? claims.username ?? '未命名用户',
    role: claims.role === 'platform-admin' ? 'platform-admin' : 'tenant-admin',
    tenantId: claims.tenantId == null ? null : String(claims.tenantId),
    permissions: permissions.map((permission) => permission as Permission)
  }
}

const initialState = readStoredState()

let currentSession: AuthSession | null = initialState.session
let currentAccessToken: string | null = initialState.accessToken
let currentRefreshToken: string | null = initialState.refreshToken

export function getCurrentSession(): AuthSession | null {
  return currentSession
}

export function getAccessToken(): string | null {
  return currentAccessToken
}

export function getRefreshToken(): string | null {
  return currentRefreshToken
}

export function getAuthorizationHeader(): Record<string, string> {
  return currentAccessToken ? { Authorization: `Bearer ${currentAccessToken}` } : {}
}

export function setCurrentSession(session: AuthSession | null): void {
  currentSession = session
  writeStoredState({ session: currentSession, accessToken: currentAccessToken, refreshToken: currentRefreshToken })
}

export function setAuthTokens(accessToken: string | null, refreshToken: string | null): void {
  currentAccessToken = accessToken
  currentRefreshToken = refreshToken
  writeStoredState({ session: currentSession, accessToken: currentAccessToken, refreshToken: currentRefreshToken })
}

export function clearCurrentSession(): void {
  currentSession = null
  currentAccessToken = null
  currentRefreshToken = null
  clearStoredState()
}

export function restoreSessionFromClaims(claims: JwtClaims | null): AuthSession {
  const normalized = normalizeClaims(claims)
  const session: AuthSession = {
    userId: normalized.userId ?? 'unknown',
    displayName: normalized.displayName ?? '未命名用户',
    role: normalized.role ?? 'tenant-admin',
    tenantId: normalized.tenantId ?? null,
    permissions: normalized.permissions ?? []
  }

  currentSession = session
  writeStoredState({ session: currentSession, accessToken: currentAccessToken, refreshToken: currentRefreshToken })
  return session
}

export function hasPermission(required: Permission | readonly Permission[] | null | undefined): boolean {
  return canAccess(currentSession, required)
}
