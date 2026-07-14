import type { UserDetail, UserListQuery, UserStatus, UserSummary } from '@/api'

export type { UserDetail, UserListQuery, UserStatus, UserSummary }
export type { UserListRequestQuery } from '@/api'

export interface UserListFilters {
  username: string
  status: UserStatus | ''
  departmentId: string
  phone: string
}

export interface UserListState {
  loading: boolean
  error: string | null
  query: UserListQuery
  items: UserSummary[]
  total: number
}
