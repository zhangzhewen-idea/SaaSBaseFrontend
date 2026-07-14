import { computed, reactive } from 'vue'

import type { PlatformTenantDetail, PlatformTenantPayload, PlatformTenantQuery, PlatformTenantSummary } from '@/api'
import { createPlatformApi } from '@/api'
import { createAdminApiRuntime } from '@/api/runtime'

import { createDefaultPlatformTenantQuery } from './platformQueries'

const platformApi = createPlatformApi(createAdminApiRuntime())

export function usePlatformTenantsModule(api = platformApi) {
  const state = reactive({
    loading: false,
    error: null as string | null,
    query: createDefaultPlatformTenantQuery(),
    items: [] as PlatformTenantSummary[],
    total: 0,
    selectedTenant: null as PlatformTenantDetail | null,
    detailLoading: false,
    detailError: null as string | null,
    actionLoading: false,
    actionError: null as string | null
  })

  const hasResults = computed(() => state.items.length > 0)

  async function loadList(query: Partial<PlatformTenantQuery> = {}): Promise<void> {
    state.loading = true
    state.error = null
    state.query = { ...state.query, ...query }

    try {
      const result = await api.list(state.query)
      state.items = result.items
      state.total = result.total
      state.query.pageNo = result.page
      state.query.pageSize = result.pageSize
    } catch (error) {
      state.error = error instanceof Error ? error.message : '平台租户列表加载失败'
    } finally {
      state.loading = false
    }
  }

  async function loadDetail(id: string): Promise<void> {
    state.detailLoading = true
    state.detailError = null

    try {
      state.selectedTenant = await api.detail(id)
    } catch (error) {
      state.detailError = error instanceof Error ? error.message : '平台租户详情加载失败'
    } finally {
      state.detailLoading = false
    }
  }

  async function saveTenant(id: string | null, payload: PlatformTenantPayload, operatorId: string): Promise<void> {
    state.actionLoading = true
    state.actionError = null

    try {
      if (id) {
        await api.update(id, { ...payload, operatorId })
      } else {
        await api.create({ ...payload, operatorId })
      }

      await loadList()
    } catch (error) {
      state.actionError = error instanceof Error ? error.message : '平台租户保存失败'
      throw error
    } finally {
      state.actionLoading = false
    }
  }

  async function updateStatus(id: string, active: boolean, operatorId: string): Promise<void> {
    state.actionLoading = true
    state.actionError = null

    try {
      await api.updateStatus(id, { active, operatorId })
      await loadList()
    } catch (error) {
      state.actionError = error instanceof Error ? error.message : '平台租户状态更新失败'
      throw error
    } finally {
      state.actionLoading = false
    }
  }

  function clearDetail(): void {
    state.selectedTenant = null
    state.detailError = null
  }

  return {
    state,
    hasResults,
    loadList,
    loadDetail,
    saveTenant,
    updateStatus,
    clearDetail
  }
}
