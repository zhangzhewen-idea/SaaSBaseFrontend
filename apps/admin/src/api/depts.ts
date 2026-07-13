import type { PageResponse } from '@saasbase/api-client'
import type { ApiRuntime } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export interface DepartmentNode {
  id: string
  parentId: string | null
  name: string
  code: string
  memberCount: number
  orderNo: number
  children?: DepartmentNode[]
}

export interface DepartmentTreeQuery {
  keyword?: string
  includeMembers?: boolean
}

export interface DepartmentMemberQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'disabled'
}

export interface DepartmentMember {
  id: string
  userId: string
  departmentId: string
  userName: string
  roleName: string
  joinedAt: string
}

export interface DepartmentPayload {
  name: string
  parentId?: string | null
  code?: string
  orderNo?: number
}

export interface DepartmentMovePayload {
  parentId: string | null
  orderNo?: number
}

export interface DepartmentMemberPayload {
  userIds: string[]
}

export function mapDepartmentTreeQuery(query: DepartmentTreeQuery): Record<string, string | boolean> {
  return {
    keyword: query.keyword ?? '',
    includeMembers: query.includeMembers ?? false
  }
}

export function mapDepartmentMemberQuery(query: DepartmentMemberQuery): Record<string, string | number> {
  return {
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword ?? '',
    status: query.status ?? ''
  }
}

export function createDepartmentsApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    tree(query: DepartmentTreeQuery = {}) {
      return http.get<DepartmentNode[]>('/admin/departments/tree', mapDepartmentTreeQuery(query))
    },
    detail(id: string) {
      return http.get<DepartmentNode>(`/admin/departments/${id}`)
    },
    members(id: string, query: DepartmentMemberQuery) {
      return http.get<PageResponse<DepartmentMember>>(`/admin/departments/${id}/members`, mapDepartmentMemberQuery(query))
    },
    create(payload: DepartmentPayload) {
      return http.post<DepartmentNode>('/admin/departments', payload)
    },
    update(id: string, payload: DepartmentPayload) {
      return http.patch<DepartmentNode>(`/admin/departments/${id}`, payload)
    },
    move(id: string, payload: DepartmentMovePayload) {
      return http.patch<DepartmentNode>(`/admin/departments/${id}/move`, payload)
    },
    addMembers(id: string, payload: DepartmentMemberPayload) {
      return http.post<void>(`/admin/departments/${id}/members`, payload)
    },
    removeMember(id: string, memberId: string) {
      return http.delete<void>(`/admin/departments/${id}/members/${memberId}`)
    }
  }
}
