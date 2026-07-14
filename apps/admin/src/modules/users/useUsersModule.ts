import { computed, reactive } from 'vue'

import type { UserDetail, UserListQuery, UserSummary } from '@/api'
import { createUsersApi } from '@/api'
import { createAdminApiRuntime } from '@/api/runtime'

import { createDefaultUserQuery } from './userQueries'

const usersApi = createUsersApi(createAdminApiRuntime())

export function useUsersModule() {
  const state = reactive({
    loading: false,
    error: null as string | null,
    query: createDefaultUserQuery(),
    items: [] as UserSummary[],
    total: 0,
    selectedUser: null as UserDetail | null,
    detailLoading: false,
    detailError: null as string | null
  })

  const hasResults = computed(() => state.items.length > 0)

  async function loadList(query: Partial<UserListQuery> = {}): Promise<void> {
    state.loading = true
    state.error = null
    state.query = { ...state.query, ...query }

    try {
      const result = await usersApi.list(state.query)
      state.items = result.items
      state.total = result.total
      state.query.page = result.page
      state.query.pageSize = result.pageSize
    } catch (error) {
      state.error = error instanceof Error ? error.message : '用户列表加载失败'
    } finally {
      state.loading = false
    }
  }

  async function loadDetail(id: string): Promise<void> {
    state.detailLoading = true
    state.detailError = null

    try {
      state.selectedUser = await usersApi.detail(id)
    } catch (error) {
      state.detailError = error instanceof Error ? error.message : '用户详情加载失败'
    } finally {
      state.detailLoading = false
    }
  }

  async function changeStatus(id: string, status: UserDetail['status']): Promise<void> {
    const current = state.items.find(item => item.id === id) ?? state.selectedUser
    await usersApi.updateStatus(id, { status, version: current?.version })
    await loadList()
  }

  async function resetPassword(id: string, password: string): Promise<void> {
    const current = state.items.find(item => item.id === id) ?? state.selectedUser
    await usersApi.resetPassword(id, { password, version: current?.version })
    await loadList()
  }

  function clearDetail(): void {
    state.selectedUser = null
    state.detailError = null
  }

  return {
    state,
    hasResults,
    loadList,
    loadDetail,
    changeStatus,
    resetPassword,
    clearDetail
  }
}
