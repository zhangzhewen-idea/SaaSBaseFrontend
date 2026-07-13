export interface ApiResponse<TData = unknown> {
  code: number
  message: string
  data: TData
  success: boolean
}

export interface PageResponse<TItem = unknown> {
  items: TItem[]
  page: number
  pageSize: number
  total: number
}
