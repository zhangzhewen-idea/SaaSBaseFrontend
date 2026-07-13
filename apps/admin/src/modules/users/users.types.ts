import type { UserDetail, UserListQuery, UserRole, UserStatus, UserSummary } from '@/api'

export type { UserDetail, UserListQuery, UserRole, UserStatus, UserSummary }
export type { UserListRequestQuery } from '@/api'

export interface UserListFilters {
  keyword: string
  status: UserStatus | ''
  role: UserRole | ''
  departmentId: string
}

export interface UserListState {
  loading: boolean
  error: string | null
  query: UserListQuery
  items: UserSummary[]
  total: number
}
