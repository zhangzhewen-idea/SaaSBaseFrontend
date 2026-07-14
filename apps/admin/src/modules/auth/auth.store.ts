import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthSession } from '@saasbase/shared'

import { login as loginWithMockAccount } from './auth.service'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthSession | null>(null)
  const isAuthenticated = computed(() => session.value !== null)

  async function login(username: string, password: string): Promise<AuthSession> {
    const nextSession = await loginWithMockAccount({ username, password })
    session.value = nextSession
    return nextSession
  }

  function logout(): void {
    session.value = null
  }

  return {
    session,
    isAuthenticated,
    login,
    logout,
  }
})
