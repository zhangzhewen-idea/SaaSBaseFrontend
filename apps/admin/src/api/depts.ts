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
}

export interface DepartmentMemberQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'disabled'
  descendants?: boolean
}

export interface DepartmentMember {
  id: string
  userId: string
  departmentId: string
  userName: string
  roleName: string
  status?: 'active' | 'disabled'
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
    keyword: query.keyword ?? ''
  }
}

export function mapDepartmentMemberQuery(query: DepartmentMemberQuery): Record<string, string | number | boolean> {
  return {
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword ?? '',
    status: query.status ?? '',
    descendants: query.descendants ?? false
  }
}

export function createDepartmentsApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    tree(query: DepartmentTreeQuery = {}) {
      return http.get<DepartmentNode[]>('/api/v1/admin/depts/tree', mapDepartmentTreeQuery(query))
    },
    detail(id: string) {
      return http.get<DepartmentNode>(`/api/v1/admin/depts/${id}`)
    },
    members(id: string, query: DepartmentMemberQuery) {
      return http.get<PageResponse<DepartmentMember>>(`/api/v1/admin/depts/${id}/members`, mapDepartmentMemberQuery(query))
    },
    create(payload: DepartmentPayload) {
      return http.post<DepartmentNode>('/api/v1/admin/depts', payload)
    },
    update(id: string, payload: DepartmentPayload) {
      return http.put<DepartmentNode>(`/api/v1/admin/depts/${id}`, payload)
    },
    move(id: string, payload: DepartmentMovePayload) {
      return http.post<DepartmentNode>(`/api/v1/admin/depts/${id}/move`, payload)
    },
    addMembers(id: string, payload: DepartmentMemberPayload) {
      return http.post<void>(`/api/v1/admin/depts/${id}/members`, payload)
    },
    removeMember(id: string, memberId: string) {
      return http.delete<void>(`/api/v1/admin/depts/${id}/members/${memberId}`)
    }
  }
}
