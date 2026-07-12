import type { AuthSession } from './auth'

export type Permission = 'platform:read' | 'tenant:read'

export function canAccess(
  session: AuthSession | null,
  required: Permission[],
): boolean {
  return session !== null && required.every((permission) =>
    session.permissions.includes(permission),
  )
}
