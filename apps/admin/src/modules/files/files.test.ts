import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FileView } from '@/api'
import { mapFileQuery, resolveFileDisposition } from '@/api'
import { createDefaultFileQuery } from './fileQueries'

const filesApiMock = {
  list: vi.fn(),
  detail: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn()
}

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    createFilesApi: () => filesApiMock
  }
})

async function createFilesModule() {
  const { useFilesModule } = await import('./useFilesModule')
  return useFilesModule()
}

describe('files api adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the default query stable', () => {
    expect(createDefaultFileQuery()).toEqual({
      pageNo: 1,
      pageSize: 20,
      filename: '',
      contentType: '',
      uploadedFrom: '',
      uploadedTo: ''
    })
  })

  it('maps file query into request params', () => {
    expect(
      mapFileQuery({
        pageNo: 2,
        pageSize: 10,
        filename: 'invoice.pdf',
        contentType: 'application/pdf',
        uploadedFrom: '2026-07-01',
        uploadedTo: '2026-07-14'
      })
    ).toEqual({
      pageNo: 2,
      pageSize: 10,
      filename: 'invoice.pdf',
      contentType: 'application/pdf',
      uploadedFrom: '2026-07-01',
      uploadedTo: '2026-07-14'
    })
  })

  it('omits blank filters from the request query', () => {
    expect(mapFileQuery(createDefaultFileQuery())).toEqual({
      pageNo: 1,
      pageSize: 20,
      filename: undefined,
      contentType: undefined,
      uploadedFrom: undefined,
      uploadedTo: undefined
    })
  })

  it('chooses inline preview only for supported content types', () => {
    expect(resolveFileDisposition('application/pdf')).toBe('inline')
    expect(resolveFileDisposition('image/png')).toBe('inline')
    expect(resolveFileDisposition('text/plain')).toBe('attachment')
  })
})

describe('files module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads files and preserves paging state', async () => {
    const module = await createFilesModule()

    filesApiMock.list.mockResolvedValueOnce({
      items: [
        {
          id: 'file-1',
          filename: 'invoice.pdf',
          contentType: 'application/pdf',
          size: 1024,
          uploadedAt: '2026-07-14 09:00:00'
        } satisfies FileView
      ],
      total: 1,
      page: 2,
      pageSize: 10
    })

    await module.loadList({
      pageNo: 2,
      pageSize: 10,
      filename: 'invoice.pdf'
    })

    expect(filesApiMock.list).toHaveBeenCalledWith({
      pageNo: 2,
      pageSize: 10,
      filename: 'invoice.pdf',
      contentType: '',
      uploadedFrom: '',
      uploadedTo: ''
    })
    expect(module.state.items).toHaveLength(1)
    expect(module.state.total).toBe(1)
    expect(module.state.query.pageNo).toBe(2)
    expect(module.hasResults.value).toBe(true)
  })

  it('loads detail, uploads and deletes files', async () => {
    const module = await createFilesModule()

    filesApiMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20
    })

    filesApiMock.detail.mockResolvedValueOnce({
      id: 'file-1',
      filename: 'invoice.pdf',
      contentType: 'application/pdf',
      size: 1024,
      uploadedAt: '2026-07-14 09:00:00'
    } satisfies FileView)

    await module.loadDetail('file-1')
    await module.upload(new Blob(['demo'], { type: 'text/plain' }))
    await module.remove('file-1')

    expect(filesApiMock.detail).toHaveBeenCalledWith('file-1')
    expect(filesApiMock.upload).toHaveBeenCalled()
    expect(filesApiMock.remove).toHaveBeenCalledWith('file-1')
    expect(module.state.detail).toBeNull()
  })
})
