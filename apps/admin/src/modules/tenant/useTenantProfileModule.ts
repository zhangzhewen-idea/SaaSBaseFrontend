import { computed, reactive } from 'vue'

import type { TenantProfileResponse } from '@/api/auth'
import { createAuthApi } from '@/api/auth'
import { createAdminApiRuntime } from '@/api/runtime'

const authApi = createAuthApi(createAdminApiRuntime())

export interface TenantProfileState {
  profile: TenantProfileResponse | null
  loading: boolean
  error: string | null
}

export function useTenantProfileModule(api = authApi) {
  const state = reactive<TenantProfileState>({
    profile: null,
    loading: false,
    error: null
  })

  const hasProfile = computed(() => state.profile !== null)

  async function loadProfile(): Promise<void> {
    state.loading = true
    state.error = null

    try {
      state.profile = await api.tenantProfile()
    } catch (error) {
      state.profile = null
      state.error = error instanceof Error ? error.message : '租户资料加载失败'
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    hasProfile,
    loadProfile
  }
}
