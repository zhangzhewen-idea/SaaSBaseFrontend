import { describe, expect, it } from 'vitest'

import { mapDepartmentMemberQuery, mapDepartmentTreeQuery } from '@/api'

describe('departments api adapter', () => {
  it('maps tree query into request params', () => {
    expect(
      mapDepartmentTreeQuery({
        keyword: '研发',
        includeMembers: true
      })
    ).toEqual({
      keyword: '研发',
      includeMembers: true
    })
  })

  it('maps member query into pagination params', () => {
    expect(
      mapDepartmentMemberQuery({
        page: 3,
        pageSize: 10,
        keyword: 'alice',
        status: 'active'
      })
    ).toEqual({
      page: 3,
      pageSize: 10,
      keyword: 'alice',
      status: 'active'
    })
  })
})
