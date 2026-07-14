import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthSession } from '@saasbase/shared'

import { login as loginWithBackend, logout as logoutWithBackend } from './auth.service'
import { clearCurrentSession, getCurrentSession, setCurrentSession } from './session'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthSession | null>(getCurrentSession())
  const tenantName = ref('SaaSBase')
  const isAuthenticated = computed(() => session.value !== null)

  async function login(tenantCode: string, username: string, password: string): Promise<AuthSession> {
    const result = await loginWithBackend({ tenantCode, username, password })
    tenantName.value = result.tenantName
    session.value = result.session
    setCurrentSession(result.session)
    return result.session
  }

  async function logout(): Promise<void> {
    await logoutWithBackend()
    clearCurrentSession()
    session.value = null
    tenantName.value = 'SaaSBase'
  }

  return {
    session,
    tenantName,
    isAuthenticated,
    login,
    logout
  }
})
