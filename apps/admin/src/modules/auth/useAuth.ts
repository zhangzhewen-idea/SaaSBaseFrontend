import { storeToRefs } from 'pinia'
import type { Permission } from '@saasbase/shared'
import { canAccess } from '@saasbase/shared'

import { useAuthStore } from './auth.store'

export function useAuth() {
  const authStore = useAuthStore()
  const { session, tenantName, isAuthenticated } = storeToRefs(authStore)

  async function signOut(): Promise<void> {
    await authStore.logout()
  }

  function syncSession(): void {
    // 由 auth store 统一维护
  }

  function hasPermission(required: Permission | readonly Permission[] | null | undefined): boolean {
    return canAccess(session.value, required)
  }

  return {
    session,
    tenantName,
    isAuthenticated,
    signOut,
    syncSession,
    hasPermission
  }
}
