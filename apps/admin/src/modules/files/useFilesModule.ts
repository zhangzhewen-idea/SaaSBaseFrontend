import { computed, reactive } from 'vue'

import type { FileQuery, FileView } from '@/api'
import { createFilesApi } from '@/api'
import { createAdminApiRuntime } from '@/api/runtime'

import { createDefaultFileQuery } from './fileQueries'

const filesApi = createFilesApi(createAdminApiRuntime())

export function useFilesModule(api = filesApi) {
  const state = reactive({
    loading: false,
    error: null as string | null,
    query: createDefaultFileQuery(),
    items: [] as FileView[],
    total: 0,
    detail: null as FileView | null,
    detailLoading: false,
    detailError: null as string | null,
    actionLoading: false,
    actionError: null as string | null
  })

  const hasResults = computed(() => state.items.length > 0)

  async function loadList(query: Partial<FileQuery> = {}): Promise<void> {
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
      state.error = error instanceof Error ? error.message : '文件列表加载失败'
    } finally {
      state.loading = false
    }
  }

  async function loadDetail(id: string): Promise<void> {
    state.detailLoading = true
    state.detailError = null

    try {
      state.detail = await api.detail(id)
    } catch (error) {
      state.detailError = error instanceof Error ? error.message : '文件详情加载失败'
    } finally {
      state.detailLoading = false
    }
  }

  async function upload(file: File | Blob): Promise<void> {
    state.actionLoading = true
    state.actionError = null

    try {
      await api.upload({ file })
      await loadList()
    } catch (error) {
      state.actionError = error instanceof Error ? error.message : '文件上传失败'
      throw error
    } finally {
      state.actionLoading = false
    }
  }

  async function remove(id: string): Promise<void> {
    state.actionLoading = true
    state.actionError = null

    try {
      await api.remove(id)
      if (state.detail?.id === id) {
        state.detail = null
      }
      await loadList()
    } catch (error) {
      state.actionError = error instanceof Error ? error.message : '文件删除失败'
      throw error
    } finally {
      state.actionLoading = false
    }
  }

  function clearDetail(): void {
    state.detail = null
    state.detailError = null
  }

  return {
    state,
    hasResults,
    loadList,
    loadDetail,
    upload,
    remove,
    clearDetail
  }
}
