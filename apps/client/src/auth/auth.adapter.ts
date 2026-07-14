import type { AuthSession } from '@saasbase/shared'

let currentSession: AuthSession | null = null

export async function login(username: string, password: string): Promise<AuthSession> {
  if (username !== 'tenant' || password !== 'demo123') {
    throw new Error('登录名或密码错误')
  }

  currentSession = {
    userId: 'tenant-demo',
    displayName: '租户用户',
    role: 'tenant_admin',
    permissions: ['tenant:read'],
  }

  return currentSession
}

export function getSession(): AuthSession | null {
  return currentSession
}

export function clearSession(): void {
  currentSession = null
}
