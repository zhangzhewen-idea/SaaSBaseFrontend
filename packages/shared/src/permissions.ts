import type { AuthSession } from './auth'
import { normalizePermission } from './utils/normalizePermission'

export type Permission = string

export type RequiredPermission = Permission | readonly Permission[]

export function canAccess(
  session: AuthSession | null | undefined,
  required: RequiredPermission | null | undefined
): boolean {
  if (required == null) {
    return true
  }

  const requiredPermissions = Array.isArray(required) ? required : [required]

  if (requiredPermissions.length === 0) {
    return true
  }

  if (!session) {
    return false
  }

  const sessionPermissions = new Set(
    session.permissions.map((permission) => normalizePermission(permission))
  )

  return requiredPermissions.every((permission) =>
    sessionPermissions.has(normalizePermission(permission))
  )
}
