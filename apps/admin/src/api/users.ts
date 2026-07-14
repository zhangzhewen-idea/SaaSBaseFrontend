import type { PageResponse } from '@saasbase/api-client'
import type { ApiRuntime } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export type UserStatus = 'active' | 'disabled'
export type UserRole = 'platform-admin' | 'tenant-admin' | 'tenant-member'

export interface UserListQuery {
  page: number
  pageSize: number
  username?: string
  status?: UserStatus
  departmentId?: string
  phone?: string
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
  version?: number
}

export interface UserDetail extends UserSummary {
  email?: string
  lastLoginAt?: string
  permissionCodes: string[]
}

export interface UserStatusPayload {
  status: UserStatus
  version?: number
}

export interface UserResetPasswordPayload {
  password: string
  version?: number
}

export interface UserListRequestQuery extends Record<string, string | number | boolean | null | undefined> {
  page: number
  size: number
  username?: string
  status?: UserStatus
  departmentId?: string
  phone?: string
}

export const DEFAULT_USER_LIST_QUERY: Readonly<UserListQuery> = Object.freeze({
  page: 1,
  pageSize: 20,
  username: '',
  status: undefined,
  departmentId: '',
  phone: ''
})

export function mapUserListQuery(query: UserListQuery): UserListRequestQuery {
  return {
    page: query.page,
    size: query.pageSize,
    username: query.username || undefined,
    status: query.status,
    departmentId: query.departmentId || undefined,
    phone: query.phone || undefined
  }
}

export function createUsersApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    list(query: UserListQuery) {
      return http.get<PageResponse<UserSummary>>('/api/v1/admin/users', mapUserListQuery(query))
    },
    detail(id: string) {
      return http.get<UserDetail>(`/api/v1/admin/users/${id}`)
    },
    updateStatus(id: string, payload: UserStatusPayload) {
      return http.post<UserDetail>(`/api/v1/admin/users/${id}/${payload.status === 'active' ? 'enable' : 'disable'}?version=${encodeURIComponent(String(payload.version ?? 1))}`)
    },
    resetPassword(id: string, payload: UserResetPasswordPayload) {
      return http.post<void>(`/api/v1/admin/users/${id}/reset-password`, {
        userId: id,
        newPassword: payload.password,
        version: payload.version ?? 1
      })
    }
  }
}
