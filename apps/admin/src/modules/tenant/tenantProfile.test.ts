import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TenantProfileResponse } from '@/api/auth'

const authApiMock = {
  tenantProfile: vi.fn()
}

vi.mock('@/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/auth')>()
  return {
    ...actual,
    createAuthApi: () => authApiMock
  }
})

async function createTenantProfileModule() {
  const { useTenantProfileModule } = await import('./useTenantProfileModule')
  return useTenantProfileModule()
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
