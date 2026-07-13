import { describe, expect, it } from 'vitest'

import { mapUserListQuery } from '@/api'

describe('users api adapter', () => {
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
      page: 2,
      pageSize: 20,
      keyword: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1'
    })
  })
})
