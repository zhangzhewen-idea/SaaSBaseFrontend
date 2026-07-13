import { describe, expect, it } from 'vitest'

import { DEFAULT_USER_LIST_QUERY, mapUserListQuery } from '@/api'
import { createDefaultUserQuery } from './userQueries'

describe('users api adapter', () => {
  it('keeps the default user query locked', () => {
    expect(createDefaultUserQuery()).toEqual(DEFAULT_USER_LIST_QUERY)
  })

  it('maps list query into page params', () => {
    expect(
      mapUserListQuery({
        page: 2,
        pageSize: 20,
        keyword: 'alice',
        status: 'active',
        role: 'tenant-admin',
        departmentId: 'dept-1'
      })
    ).toEqual({
      pageNo: 2,
      pageSize: 20,
      keyword: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1'
    })
  })

  it('omits empty optional filters from the request query', () => {
    expect(
      mapUserListQuery({
        ...DEFAULT_USER_LIST_QUERY
      })
    ).toEqual({
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined,
      role: undefined,
      departmentId: undefined
    })
  })
})
