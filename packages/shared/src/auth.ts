import type { Permission } from './permissions'

export type UserRole = 'platform-admin' | 'tenant-admin' | 'tenant-member'

export interface AuthSession {
  userId: string
  displayName: string
  role: UserRole
  permissions: Permission[]
  tenantId?: string | null
}
