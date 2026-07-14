import type { AuthSession, Permission } from '../../../../../packages/shared/src/index'
import { canAccess } from '../../../../../packages/shared/src/index'

const DEMO_SESSION: AuthSession = {
  userId: 'admin-demo',
  displayName: '租户管理员',
  role: 'tenant-admin',
  tenantId: 'tenant-demo',
  permissions: ['tenant-dashboard:view', 'tenant-user:view', 'tenant-department:view']
}

let currentSession: AuthSession | null = DEMO_SESSION

export function getDemoSession(): AuthSession {
  return DEMO_SESSION
}

export function getCurrentSession(): AuthSession | null {
  return currentSession
}

export function setCurrentSession(session: AuthSession | null): void {
  currentSession = session
}

export function clearCurrentSession(): void {
  currentSession = null
}

export function restoreDemoSession(): void {
  currentSession = DEMO_SESSION
}

export function hasPermission(required: Permission | readonly Permission[] | null | undefined): boolean {
  return canAccess(currentSession, required)
}
