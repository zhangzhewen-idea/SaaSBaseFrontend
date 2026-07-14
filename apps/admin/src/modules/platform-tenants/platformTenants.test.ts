import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createPlatformTenantsApi,
  mapPlatformTenantListQuery
} from '@/api'

describe('platform tenants api adapter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps pageNo and pageSize and omits empty filters', () => {
    expect(
      mapPlatformTenantListQuery({
        pageNo: 2,
        pageSize: 20,
        tenantName: 'Alpha',
        tenantCode: '',
        status: 'enabled'
      })
    ).toEqual({
      pageNo: 2,
      pageSize: 20,
      tenantName: 'Alpha',
      tenantCode: undefined,
      status: 'enabled'
    })
  })

  it('trims whitespace around filters', () => {
    expect(
      mapPlatformTenantListQuery({
        pageNo: 1,
        pageSize: 10,
        tenantName: '  Alpha  ',
        tenantCode: '\tBeta\t',
        status: undefined
      })
    ).toEqual({
      pageNo: 1,
      pageSize: 10,
      tenantName: 'Alpha',
      tenantCode: 'Beta',
      status: undefined
    })
  })

  it('builds list and write urls with pageNo/pageSize and operatorId', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json')
      },
      json: vi.fn().mockResolvedValue({
        success: true,
        data: { items: [], total: 0, pageNo: 1, pageSize: 20 }
      })
    })

    vi.stubGlobal('fetch', fetchSpy)

    const api = createPlatformTenantsApi({
      baseUrl: 'http://localhost:3000/api/v1'
    })

    await api.list({
      pageNo: 2,
      pageSize: 20,
      tenantName: 'Alpha',
      tenantCode: '',
      status: 'enabled'
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/platform/tenants?pageNo=2&pageSize=20&tenantName=Alpha&status=enabled',
      expect.objectContaining({ method: 'GET' })
    )

    await api.create({
      tenantName: 'Alpha',
      tenantCode: 'alpha',
      operatorId: 'operator-1'
    })

    await api.update('tenant-1', {
      tenantName: 'Beta',
      tenantCode: 'beta',
      operatorId: 'operator-2'
    })

    await api.enable('tenant-1', {
      operatorId: 'operator-3'
    })

    await api.disable('tenant-1', {
      operatorId: 'operator-4'
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/platform/tenants?operatorId=operator-1',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          tenantName: 'Alpha',
          tenantCode: 'alpha',
          remark: undefined
        })
      })
    )
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/platform/tenants/tenant-1?operatorId=operator-2',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          tenantName: 'Beta',
          tenantCode: 'beta',
          remark: undefined
        })
      })
    )
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/platform/tenants/tenant-1/enable?operatorId=operator-3',
      expect.objectContaining({ method: 'POST' })
    )
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/platform/tenants/tenant-1/disable?operatorId=operator-4',
      expect.objectContaining({ method: 'POST' })
    )
  })
})
