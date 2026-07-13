import { reactive } from 'vue'

import type { DepartmentMember, DepartmentMemberQuery, DepartmentNode } from '@/api'
import { createDepartmentsApi } from '@/api'

import { createDefaultDepartmentMemberQuery, createDefaultDepartmentTreeQuery } from './deptQueries'

const departmentsApi = createDepartmentsApi()

export function useDepartmentsModule() {
  const state = reactive({
    treeLoading: false,
    memberLoading: false,
    error: null as string | null,
    treeQuery: createDefaultDepartmentTreeQuery(),
    memberQuery: createDefaultDepartmentMemberQuery(),
    tree: [] as DepartmentNode[],
    members: [] as DepartmentMember[],
    total: 0,
    selectedDepartmentId: '' as string,
    selectedDepartmentName: ''
  })

  async function loadTree(query: Partial<typeof state.treeQuery> = {}): Promise<void> {
    state.treeLoading = true
    state.error = null
    state.treeQuery = { ...state.treeQuery, ...query }

    try {
      state.tree = await departmentsApi.tree(state.treeQuery)
      const firstNode = state.tree[0]
      if (!state.selectedDepartmentId && firstNode) {
        state.selectedDepartmentId = firstNode.id
        state.selectedDepartmentName = firstNode.name
        await loadMembers(firstNode.id)
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : '部门树加载失败'
    } finally {
      state.treeLoading = false
    }
  }

  async function loadMembers(id: string, query: Partial<DepartmentMemberQuery> = {}): Promise<void> {
    state.memberLoading = true
    state.error = null
    state.selectedDepartmentId = id
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
      state.memberLoading = false
    }
  }

  async function addMembers(id: string, userIds: string[]): Promise<void> {
    await departmentsApi.addMembers(id, { userIds })
  }

  async function removeMember(id: string, memberId: string): Promise<void> {
    await departmentsApi.removeMember(id, memberId)
    if (id === state.selectedDepartmentId) {
      await loadMembers(id)
    }
  }

  function selectDepartment(node: DepartmentNode): void {
    state.selectedDepartmentId = node.id
    state.selectedDepartmentName = node.name
  }

  return {
    state,
    loadTree,
    loadMembers,
    addMembers,
    removeMember,
    selectDepartment
  }
}
