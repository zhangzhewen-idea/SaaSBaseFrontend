import { computed, reactive } from 'vue'

import type { DepartmentMember, DepartmentMemberQuery, DepartmentMovePayload, DepartmentNode, DepartmentPayload } from '@/api'
import { createDepartmentsApi } from '@/api'
import { createAdminApiRuntime } from '@/api/runtime'

import { createDefaultDepartmentMemberQuery, createDefaultDepartmentTreeQuery } from './deptQueries'

export function useDepartmentsModule(api = createDepartmentsApi(createAdminApiRuntime())) {
  const state = reactive({
    treeLoading: false,
    memberLoading: false,
    actionLoading: false,
    error: null as string | null,
    actionError: null as string | null,
    treeQuery: createDefaultDepartmentTreeQuery(),
    memberQuery: createDefaultDepartmentMemberQuery(),
    tree: [] as DepartmentNode[],
    members: [] as DepartmentMember[],
    total: 0,
    selectedDepartmentId: '' as string,
    selectedDepartmentName: '',
    selectedDepartmentCode: '',
    selectedDepartmentParentId: null as string | null,
    selectedDepartmentOrderNo: 0
  })

  const selectedDepartment = computed(() => findDepartmentNode(state.tree, state.selectedDepartmentId))

  async function loadTree(query: Partial<typeof state.treeQuery> = {}): Promise<void> {
    state.treeLoading = true
    state.error = null
    state.treeQuery = { ...state.treeQuery, ...query }

    try {
      state.tree = await api.tree(state.treeQuery)
      const currentNode = state.selectedDepartmentId ? findDepartmentNode(state.tree, state.selectedDepartmentId) : null
      const firstNode = state.tree[0]

      if (currentNode) {
        syncSelectedDepartment(currentNode)
      } else if (firstNode) {
        syncSelectedDepartment(firstNode)
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
      const result = await api.members(id, { ...state.memberQuery, descendants: false })
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

  async function createDepartment(payload: DepartmentPayload): Promise<void> {
    await runAction(() => api.create(payload))
  }

  async function updateDepartment(id: string, payload: DepartmentPayload): Promise<void> {
    await runAction(() => api.update(id, payload))
  }

  async function moveDepartment(id: string, payload: DepartmentMovePayload): Promise<void> {
    await runAction(() => api.move(id, payload))
  }

  async function addMembers(id: string, userIds: string[]): Promise<void> {
    await runAction(() => api.addMembers(id, { userIds }))
    if (id === state.selectedDepartmentId) {
      await loadMembers(id)
    }
  }

  async function removeMember(id: string, memberId: string): Promise<void> {
    await runAction(() => api.removeMember(id, memberId))
    if (id === state.selectedDepartmentId) {
      await loadMembers(id)
    }
  }

  function selectDepartment(node: DepartmentNode): void {
    syncSelectedDepartment(node)
  }

  function syncSelectedDepartment(node: DepartmentNode): void {
    state.selectedDepartmentId = node.id
    state.selectedDepartmentName = node.name
    state.selectedDepartmentCode = node.code
    state.selectedDepartmentParentId = node.parentId
    state.selectedDepartmentOrderNo = node.orderNo
  }

  async function runAction<T>(operation: () => Promise<T>): Promise<T> {
    state.actionLoading = true
    state.actionError = null

    try {
      const result = await operation()
      await loadTree()
      return result
    } catch (error) {
      state.actionError = error instanceof Error ? error.message : '部门操作失败'
      throw error
    } finally {
      state.actionLoading = false
    }
  }

  function findDepartmentNode(nodes: DepartmentNode[], id: string): DepartmentNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node
      }

      const child = findDepartmentNode(node.children ?? [], id)
      if (child) {
        return child
      }
    }

    return null
  }

  return {
    state,
    selectedDepartment,
    loadTree,
    loadMembers,
    createDepartment,
    updateDepartment,
    moveDepartment,
    addMembers,
    removeMember,
    selectDepartment
  }
}
