import type { DepartmentMemberQuery, DepartmentTreeQuery } from '@/api'

export function createDefaultDepartmentTreeQuery(): DepartmentTreeQuery {
  return {
    keyword: ''
  }
}

export function createDefaultDepartmentMemberQuery(): DepartmentMemberQuery {
  return {
    page: 1,
    pageSize: 20,
    keyword: '',
    status: undefined
  }
}
