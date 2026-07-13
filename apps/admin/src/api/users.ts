import type { PageResponse } from '@saasbase/api-client'
import type { ApiRuntime } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export type UserStatus = 'active' | 'disabled'
export type UserRole = 'platform-admin' | 'tenant-admin' | 'tenant-member'

export interface UserListQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: UserStatus
  role?: UserRole
  departmentId?: string
}

export interface UserSummary {
  id: string
  name: string
  username: string
  phone?: string
  status: UserStatus
  role: UserRole
  departmentId?: string
  updatedAt: string
}

export interface UserDetail extends UserSummary {
  email?: string
  lastLoginAt?: string
  permissionCodes: string[]
}

export interface UserStatusPayload {
  status: UserStatus
}

export interface UserResetPasswordPayload {
  password: string
}

export interface UserListRequestQuery extends Record<string, string | number | boolean | null | undefined> {
  pageNo: number
  pageSize: number
  keyword?: string
  status?: UserStatus
  role?: UserRole
  departmentId?: string
}

export const DEFAULT_USER_LIST_QUERY: Readonly<UserListQuery> = Object.freeze({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: undefined,
  role: undefined,
  departmentId: ''
})

export function mapUserListQuery(query: UserListQuery): UserListRequestQuery {
  return {
    pageNo: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword || undefined,
    status: query.status,
    role: query.role,
    departmentId: query.departmentId || undefined
  }
}

export function createUsersApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    list(query: UserListQuery) {
      return http.get<PageResponse<UserSummary>>('/admin/users', mapUserListQuery(query))
    },
    detail(id: string) {
      return http.get<UserDetail>(`/admin/users/${id}`)
    },
    updateStatus(id: string, payload: UserStatusPayload) {
      return http.patch<UserDetail>(`/admin/users/${id}/status`, payload)
    },
    resetPassword(id: string, payload: UserResetPasswordPayload) {
      return http.post<void>(`/admin/users/${id}/reset-password`, payload)
    }
  }
}
