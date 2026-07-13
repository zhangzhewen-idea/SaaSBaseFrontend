import type { UserListQuery } from '@/api'
import { DEFAULT_USER_LIST_QUERY } from '@/api'

export function createDefaultUserQuery(): UserListQuery {
  return { ...DEFAULT_USER_LIST_QUERY }
}
