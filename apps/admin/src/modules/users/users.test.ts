import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { UserDetail, UserSummary } from '@/api'
import { DEFAULT_USER_LIST_QUERY, mapUserListQuery } from '@/api'
import { createDefaultUserQuery } from './userQueries'

const usersApiMock = {
  list: vi.fn(),
  detail: vi.fn(),
  updateStatus: vi.fn(),
  resetPassword: vi.fn()
}

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()

  return {
    ...actual,
    createUsersApi: () => usersApiMock
  }
})

async function createUsersModule() {
  const { useUsersModule } = await import('./useUsersModule')
  return useUsersModule()
}

describe('users api adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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

  it('loads the user list with stable paging and filters', async () => {
    const module = await createUsersModule()

    usersApiMock.list.mockResolvedValueOnce({
      items: [
        {
          id: 'u-1',
          name: 'Alice',
          username: 'alice',
          status: 'active',
          role: 'tenant-admin',
          departmentId: 'dept-1',
          updatedAt: '2026-07-14 09:00:00'
        } satisfies UserSummary
      ],
      total: 1,
      page: 2,
      pageSize: 10
    })

    await module.loadList({
      page: 2,
      pageSize: 10,
      keyword: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1'
    })

    expect(usersApiMock.list).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      keyword: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1'
    })
    expect(module.state.items).toHaveLength(1)
    expect(module.state.total).toBe(1)
    expect(module.state.query.page).toBe(2)
    expect(module.state.query.pageSize).toBe(10)
    expect(module.hasResults.value).toBe(true)
  })

  it('refreshes the current query after status changes and password resets', async () => {
    const module = await createUsersModule()

    usersApiMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20
    })

    await module.loadList({
      page: 3,
      pageSize: 20,
      keyword: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1'
    })

    await module.changeStatus('u-1', 'disabled')
    await module.resetPassword('u-1', 'ChangeMe123!')

    expect(usersApiMock.updateStatus).toHaveBeenCalledWith('u-1', { status: 'disabled' })
    expect(usersApiMock.resetPassword).toHaveBeenCalledWith('u-1', { password: 'ChangeMe123!' })
    expect(usersApiMock.list).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      keyword: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1'
    })
  })

  it('loads user detail and can clear it', async () => {
    const module = await createUsersModule()

    usersApiMock.detail.mockResolvedValueOnce({
      id: 'u-1',
      name: 'Alice',
      username: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1',
      updatedAt: '2026-07-14 09:00:00',
      email: 'alice@example.com',
      lastLoginAt: '2026-07-14 10:00:00',
      permissionCodes: ['user:read', 'user:update']
    } satisfies UserDetail)

    await module.loadDetail('u-1')

    expect(usersApiMock.detail).toHaveBeenCalledWith('u-1')
    expect(module.state.selectedUser?.id).toBe('u-1')

    module.clearDetail()

    expect(module.state.selectedUser).toBeNull()
    expect(module.state.detailError).toBeNull()
  })
})
