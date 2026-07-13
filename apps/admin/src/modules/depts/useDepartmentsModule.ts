import { reactive } from 'vue'

import type { DepartmentMember, DepartmentMemberQuery, DepartmentNode } from '@/api'
import { createDepartmentsApi } from '@/api'

import { createDefaultDepartmentMemberQuery, createDefaultDepartmentTreeQuery } from './deptQueries'

const departmentsApi = createDepartmentsApi()

export function useDepartmentsModule() {
  const state = reactive({
    loading: false,
    error: null as string | null,
    treeQuery: createDefaultDepartmentTreeQuery(),
    memberQuery: createDefaultDepartmentMemberQuery(),
    tree: [] as DepartmentNode[],
    members: [] as DepartmentMember[],
    total: 0
  })

  async function loadTree(query: Partial<typeof state.treeQuery> = {}): Promise<void> {
    state.loading = true
    state.error = null
    state.treeQuery = { ...state.treeQuery, ...query }

    try {
      state.tree = await departmentsApi.tree(state.treeQuery)
    } catch (error) {
      state.error = error instanceof Error ? error.message : '部门树加载失败'
    } finally {
      state.loading = false
    }
  }

  async function loadMembers(id: string, query: Partial<DepartmentMemberQuery> = {}): Promise<void> {
    state.loading = true
    state.error = null
    state.memberQuery = { ...state.memberQuery, ...query }

    try {
      const result = await departmentsApi.members(id, state.memberQuery)
      state.members = result.items
      state.total = result.total
      state.memberQuery.page = result.page
      state.memberQuery.pageSize = result.pageSize
    } catch (error) {
      state.error = error instanceof Error ? error.message : '部门成员加载失败'
    } finally {
      state.loading = false
    }
  }

  async function addMembers(id: string, userIds: string[]): Promise<void> {
    await departmentsApi.addMembers(id, { userIds })
  }

  async function removeMember(id: string, memberId: string): Promise<void> {
    await departmentsApi.removeMember(id, memberId)
  }

  return {
    state,
    loadTree,
    loadMembers,
    addMembers,
    removeMember
  }
}
