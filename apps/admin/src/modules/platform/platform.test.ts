import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PlatformTenantDetail, PlatformTenantSummary } from '@/api'
import { mapPlatformTenantListQuery } from '@/api'
import PlatformTenantPage from './PlatformTenantPage.vue'
import { createDefaultPlatformTenantQuery } from './platformQueries'

const platformApiMock = vi.hoisted(() => ({
  list: vi.fn(),
  detail: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn()
}))

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    createPlatformApi: () => platformApiMock
  }
})

async function createPlatformModule() {
  const { usePlatformTenantsModule } = await import('./usePlatformTenantsModule')
  return usePlatformTenantsModule(platformApiMock)
}

describe('platform tenant api adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the default query stable', () => {
    expect(createDefaultPlatformTenantQuery()).toEqual({
      pageNo: 1,
      pageSize: 20,
      keyword: '',
      status: undefined
    })
  })

  it('maps platform query into request params', () => {
    expect(
      mapPlatformTenantListQuery({
        pageNo: 2,
        pageSize: 10,
        tenantName: 'demo',
        tenantCode: 'code-a',
        status: 'enabled'
      })
    ).toEqual({
      pageNo: 2,
      pageSize: 10,
      tenantName: 'demo',
      tenantCode: 'code-a',
      status: 'enabled'
    })
  })

  it('omits blank filters from the request query', () => {
    expect(mapPlatformTenantListQuery({
      pageNo: 1,
      pageSize: 20,
      tenantName: '',
      tenantCode: ''
    })).toEqual({
      pageNo: 1,
      pageSize: 20,
      tenantName: undefined,
      tenantCode: undefined,
      status: undefined
    })
  })
})

describe('platform tenant module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads tenants and preserves paging state', async () => {
    const module = await createPlatformModule()

    platformApiMock.list.mockResolvedValueOnce({
      items: [
        {
          id: 'tenant-1',
          tenantCode: 'tenant-a',
          tenantName: 'A 公司',
          status: 'enabled',
          updatedAt: '2026-07-14 09:00:00'
        } satisfies PlatformTenantSummary
      ],
      total: 1,
      page: 2,
      pageSize: 10
    })

    await module.loadList({
      pageNo: 2,
      pageSize: 10,
      keyword: 'A',
      status: 'active'
    })

    expect(platformApiMock.list).toHaveBeenCalledWith({
      pageNo: 2,
      pageSize: 10,
      keyword: 'A',
      status: 'active'
    })
    expect(module.state.items).toHaveLength(1)
    expect(module.state.total).toBe(1)
    expect(module.state.query.pageNo).toBe(2)
    expect(module.state.query.pageSize).toBe(10)
    expect(module.hasResults.value).toBe(true)
  })

  it('loads detail and can clear it', async () => {
    const module = await createPlatformModule()

    platformApiMock.detail.mockResolvedValueOnce({
      id: 'tenant-1',
      tenantCode: 'tenant-a',
      tenantName: 'A 公司',
      status: 'enabled',
      updatedAt: '2026-07-14 09:00:00'
    } satisfies PlatformTenantDetail)

    await module.loadDetail('tenant-1')

    expect(platformApiMock.detail).toHaveBeenCalledWith('tenant-1')
    expect(module.state.selectedTenant?.id).toBe('tenant-1')

    module.clearDetail()

    expect(module.state.selectedTenant).toBeNull()
    expect(module.state.detailError).toBeNull()
  })

  it('creates, updates and toggles tenants with operator id', async () => {
    const module = await createPlatformModule()

    platformApiMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20
    })

    await module.saveTenant(null, {
      tenantCode: 'tenant-b',
      tenantName: 'B 公司',
      adminUsername: 'bob'
    }, 'operator-1')

    await module.saveTenant('tenant-1', {
      tenantCode: 'tenant-a',
      tenantName: 'A 公司',
      adminUsername: 'alice'
    }, 'operator-2')

    await module.updateStatus('tenant-1', false, 'operator-3')

    expect(platformApiMock.create).toHaveBeenCalledWith({
      tenantCode: 'tenant-b',
      tenantName: 'B 公司',
      adminUsername: 'bob',
      adminDisplayName: undefined,
      contactName: undefined,
      contactPhone: undefined,
      contactEmail: undefined,
      remark: undefined,
      operatorId: 'operator-1'
    })
    expect(platformApiMock.update).toHaveBeenCalledWith('tenant-1', {
      tenantCode: 'tenant-a',
      tenantName: 'A 公司',
      adminUsername: 'alice',
      adminDisplayName: undefined,
      contactName: undefined,
      contactPhone: undefined,
      contactEmail: undefined,
      remark: undefined,
      operatorId: 'operator-2'
    })
    expect(platformApiMock.updateStatus).toHaveBeenCalledWith('tenant-1', {
      active: false,
      operatorId: 'operator-3'
    })
  })
})

describe('platform overview page', () => {
  it('shows the tenant management page', () => {
    platformApiMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20
    })
    const wrapper = mount(PlatformTenantPage, {
      global: {
        plugins: [ElementPlus]
      }
    })

    expect(wrapper.text()).toContain('平台租户管理')
    expect(wrapper.text()).toContain('新增租户')
    expect(wrapper.text()).toContain('租户列表')
  })
})
