import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchTenantProfile } from './profile.api'

describe('profile api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests the tenant profile endpoint and returns the data', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          tenantId: 'tenant-1',
          tenantCode: 'tenant-a',
          tenantName: 'A 公司',
          adminUsername: 'alice',
          adminDisplayName: 'Alice',
          permissions: ['tenant:profile:read']
        }
      })
    })

    vi.stubGlobal('fetch', fetchSpy)

    await expect(fetchTenantProfile()).resolves.toEqual({
      tenantId: 'tenant-1',
      tenantCode: 'tenant-a',
      tenantName: 'A 公司',
      adminUsername: 'alice',
      adminDisplayName: 'Alice',
      permissions: ['tenant:profile:read']
    })
    expect(fetchSpy).toHaveBeenCalledWith('/api/v1/admin/tenant/profile', {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })
  })

  it('surfaces backend failures', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: false,
        message: '权限不足',
        data: null
      })
    })

    vi.stubGlobal('fetch', fetchSpy)

    await expect(fetchTenantProfile()).rejects.toThrow('权限不足')
  })
})
