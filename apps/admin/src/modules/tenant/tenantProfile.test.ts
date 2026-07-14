import { mount, flushPromises } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TenantProfileResponse } from '@/api/auth'
import TenantProfilePage from './TenantProfilePage.vue'

const authApiMock = vi.hoisted(() => ({
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  tenantProfile: vi.fn()
}))

vi.mock('@/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/auth')>()
  return {
    ...actual,
    createAuthApi: () => authApiMock
  }
})

async function createTenantProfileModule() {
  const { useTenantProfileModule } = await import('./useTenantProfileModule')
  return useTenantProfileModule(authApiMock as any)
}

describe('tenant profile module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads current tenant profile from the backend', async () => {
    const module = await createTenantProfileModule()

    authApiMock.tenantProfile.mockResolvedValueOnce({
      tenantId: 'tenant-1',
      tenantCode: 'tenant-a',
      tenantName: 'A 公司',
      adminUsername: 'alice',
      adminDisplayName: 'Alice',
      permissions: ['tenant:profile:read']
    } satisfies TenantProfileResponse)

    await module.loadProfile()

    expect(authApiMock.tenantProfile).toHaveBeenCalledTimes(1)
    expect(module.state.profile?.tenantName).toBe('A 公司')
    expect(module.state.error).toBeNull()
  })

  it('keeps a readable error when the request fails', async () => {
    const module = await createTenantProfileModule()

    authApiMock.tenantProfile.mockRejectedValueOnce(new Error('request failed'))

    await module.loadProfile()

    expect(module.state.error).toBe('request failed')
    expect(module.state.profile).toBeNull()
  })
})

describe('tenant profile page', () => {
  it('renders the tenant profile content', async () => {
    authApiMock.tenantProfile.mockResolvedValueOnce({
      tenantId: 'tenant-1',
      tenantCode: 'tenant-a',
      tenantName: 'A 公司',
      adminUsername: 'alice',
      adminDisplayName: 'Alice',
      permissions: ['tenant:profile:read']
    } satisfies TenantProfileResponse)

    const wrapper = mount(TenantProfilePage, {
      global: {
        plugins: [ElementPlus]
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('租户资料')
    expect(wrapper.text()).toContain('刷新')
    expect(wrapper.text()).toContain('可见权限')
  })
})
