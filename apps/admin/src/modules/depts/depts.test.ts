import { describe, expect, it } from 'vitest'

import { createDefaultDepartmentMemberQuery, createDefaultDepartmentTreeQuery } from './deptQueries'

import { mapDepartmentMemberQuery, mapDepartmentTreeQuery } from '@/api'

describe('departments api adapter', () => {
  it('creates default tree query', () => {
    expect(createDefaultDepartmentTreeQuery()).toEqual({
      keyword: '',
      includeMembers: false
    })
  })

  it('creates default member query', () => {
    expect(createDefaultDepartmentMemberQuery()).toEqual({
      page: 1,
      pageSize: 20,
      keyword: '',
      status: undefined
    })
  })

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
