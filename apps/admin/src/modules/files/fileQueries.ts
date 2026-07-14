import type { FileQuery } from '@/api'

export function createDefaultFileQuery(): FileQuery {
  return {
    pageNo: 1,
    pageSize: 20,
    filename: '',
    contentType: '',
    uploadedFrom: '',
    uploadedTo: ''
  }
}
