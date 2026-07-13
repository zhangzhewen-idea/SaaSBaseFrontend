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

export function mapUserListQuery(query: UserListQuery): Record<string, string | number> {
  return {
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword ?? '',
    status: query.status ?? '',
    role: query.role ?? '',
    departmentId: query.departmentId ?? ''
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
