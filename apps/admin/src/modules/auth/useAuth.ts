import { computed, ref } from 'vue'

import type { AuthSession, Permission } from '@saasbase/shared'
import { canAccess } from '@saasbase/shared'
import {
  clearCurrentSession,
  getCurrentSession,
  getDemoSession,
  restoreDemoSession,
  setCurrentSession
} from './session'

const session = ref<AuthSession | null>(getCurrentSession())

export function useAuth() {
  const isAuthenticated = computed(() => session.value !== null)
  const sessionUser = computed(() => session.value)

  function signInAsDemo(): void {
    restoreDemoSession()
    session.value = getCurrentSession()
  }

  function signOut(): void {
    clearCurrentSession()
    session.value = null
  }

  function syncSession(nextSession: AuthSession | null): void {
    setCurrentSession(nextSession)
    session.value = nextSession
  }

  function hasPermission(required: Permission | readonly Permission[] | null | undefined): boolean {
    return canAccess(session.value, required)
  }

  return {
    session,
    sessionUser,
    isAuthenticated,
    demoSession: getDemoSession(),
    signInAsDemo,
    signOut,
    syncSession,
    hasPermission
  }
}
