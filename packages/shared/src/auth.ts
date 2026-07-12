import type { Permission } from './permissions'

export type UserRole = 'platform_admin' | 'tenant_admin' | 'member'

export interface AuthSession {
  userId: string
  displayName: string
  role: UserRole
  permissions: Permission[]
}
