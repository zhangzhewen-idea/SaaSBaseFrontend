import type { UserListQuery } from '@/api'

export function createDefaultUserQuery(): UserListQuery {
  return {
    page: 1,
    pageSize: 20,
    keyword: '',
    status: undefined,
    role: undefined,
    departmentId: ''
  }
}
