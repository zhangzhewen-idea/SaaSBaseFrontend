import type { ApiRuntime, PageResponse } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export interface FileQuery {
  pageNo: number
  pageSize: number
  filename?: string
  contentType?: string
  uploadedFrom?: string
  uploadedTo?: string
}

export interface FileView {
  id: string
  filename: string
  contentType: string
  size: number
  uploadedAt: string
  uploadedFrom?: string
  uploadedBy?: string
}

export interface FileUploadPayload {
  file: File | Blob
}

export function mapFileQuery(query: FileQuery): Record<string, string | number | undefined> {
  return {
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    filename: query.filename?.trim() || undefined,
    contentType: query.contentType?.trim() || undefined,
    uploadedFrom: query.uploadedFrom?.trim() || undefined,
    uploadedTo: query.uploadedTo?.trim() || undefined
  }
}

export function createFilesApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    list(query: FileQuery) {
      return http.get<PageResponse<FileView>>('/api/v1/admin/files', mapFileQuery(query))
    },
    detail(id: string) {
      return http.get<FileView>(`/api/v1/admin/files/${id}`)
    },
    upload(payload: FileUploadPayload) {
      const formData = new FormData()
      formData.append('file', payload.file)
      return http.post<FileView>('/api/v1/admin/files', formData)
    },
    remove(id: string) {
      return http.delete<void>(`/api/v1/admin/files/${id}`)
    },
    contentUrl(id: string, disposition: 'inline' | 'attachment' = 'attachment'): string {
      return `/api/v1/admin/files/${id}/content?disposition=${encodeURIComponent(disposition)}`
    }
  }
}

export function resolveFileDisposition(contentType: string): 'inline' | 'attachment' {
  return ['application/pdf', 'image/png', 'image/jpeg'].includes(contentType) ? 'inline' : 'attachment'
}
