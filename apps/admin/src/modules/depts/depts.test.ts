import { describe, expect, it, vi } from 'vitest'

import { createDefaultDepartmentMemberQuery, createDefaultDepartmentTreeQuery } from './deptQueries'
import { useDepartmentsModule } from './useDepartmentsModule'

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

describe('departments module', () => {
  const tree = [
    {
      id: 'dept-root',
      parentId: null,
      name: '总部',
      code: 'HQ',
      memberCount: 3,
      orderNo: 1,
      children: [
        {
          id: 'dept-child',
          parentId: 'dept-root',
          name: '研发部',
          code: 'RD',
          memberCount: 2,
          orderNo: 1
        }
      ]
    }
  ]

  const members = {
    items: [
      {
        id: 'member-1',
        userId: 'user-1',
        departmentId: 'dept-root',
        userName: 'Alice',
        roleName: '管理员',
        status: 'active',
        joinedAt: '2026-07-01'
      }
    ],
    page: 1,
    pageSize: 20,
    total: 1
  }

  function createApi() {
    return {
      tree: vi.fn().mockResolvedValue(tree),
      detail: vi.fn(),
      members: vi.fn().mockResolvedValue(members),
      create: vi.fn().mockResolvedValue(tree[0]),
      update: vi.fn().mockResolvedValue(tree[0]),
      move: vi.fn().mockResolvedValue(tree[0]),
      addMembers: vi.fn().mockResolvedValue(undefined),
      removeMember: vi.fn().mockResolvedValue(undefined)
    }
  }

  it('loads the first department and its members', async () => {
    const api = createApi()
    const module = useDepartmentsModule(api)

    await module.loadTree()

    expect(api.tree).toHaveBeenCalledWith({ keyword: '', includeMembers: false })
    expect(api.members).toHaveBeenCalledWith('dept-root', {
      page: 1,
      pageSize: 20,
      keyword: '',
      status: undefined
    })
    expect(module.state.selectedDepartmentId).toBe('dept-root')
    expect(module.state.selectedDepartmentName).toBe('总部')
    expect(module.state.members).toEqual(members.items)
    expect(module.state.total).toBe(1)
  })

  it('refreshes members after add and remove operations', async () => {
    const api = createApi()
    const module = useDepartmentsModule(api)

    await module.loadTree()
    api.members.mockClear()

    await module.addMembers('dept-root', ['user-2'])
    await module.removeMember('dept-root', 'member-1')

    expect(api.addMembers).toHaveBeenCalledWith('dept-root', { userIds: ['user-2'] })
    expect(api.removeMember).toHaveBeenCalledWith('dept-root', 'member-1')
    expect(api.members).toHaveBeenNthCalledWith(1, 'dept-root', {
      page: 1,
      pageSize: 20,
      keyword: '',
      status: undefined
    })
    expect(api.members).toHaveBeenNthCalledWith(2, 'dept-root', {
      page: 1,
      pageSize: 20,
      keyword: '',
      status: undefined
    })
  })

  it('creates, updates and moves departments through the api', async () => {
    const api = createApi()
    const module = useDepartmentsModule(api)

    await module.createDepartment({
      name: '测试部门',
      parentId: 'dept-root',
      code: 'TEST',
      orderNo: 2
    })
    await module.updateDepartment('dept-child', {
      name: '研发中心',
      parentId: 'dept-root',
      code: 'RDC',
      orderNo: 3
    })
    await module.moveDepartment('dept-child', {
      parentId: null,
      orderNo: 1
    })

    expect(api.create).toHaveBeenCalledWith({
      name: '测试部门',
      parentId: 'dept-root',
      code: 'TEST',
      orderNo: 2
    })
    expect(api.update).toHaveBeenCalledWith('dept-child', {
      name: '研发中心',
      parentId: 'dept-root',
      code: 'RDC',
      orderNo: 3
    })
    expect(api.move).toHaveBeenCalledWith('dept-child', {
      parentId: null,
      orderNo: 1
    })
  })
})
