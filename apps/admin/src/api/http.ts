import type { ApiResponse, ApiRuntime } from '@saasbase/api-client'

import { getAuthorizationHeader } from '../modules/auth/session'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | null | undefined>
  body?: unknown
  headers?: Record<string, string>
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  const url = baseUrl.startsWith('/') ? new URL(path, origin) : new URL(path, baseUrl)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === '') {
      continue
    }

    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

function assertBaseUrl(runtime: ApiRuntime | undefined): string {
  const baseUrl = runtime?.baseUrl?.trim() || import.meta.env.VITE_ADMIN_API_BASE_URL?.trim()

  if (!baseUrl) {
    throw new Error('请先配置 VITE_ADMIN_API_BASE_URL，再访问管理端接口')
  }

  return baseUrl
}

async function request<TData>(runtime: ApiRuntime | undefined, path: string, options: RequestOptions = {}): Promise<TData> {
  const baseUrl = assertBaseUrl(runtime)
  const response = await fetch(buildUrl(baseUrl, path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthorizationHeader(),
      ...runtime?.headers,
      ...options.headers
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(`接口返回了非 JSON 内容: ${response.status}`)
  }

  const payload = (await response.json()) as ApiResponse<TData>

  if (!payload.success) {
    throw new Error(payload.message || 'Request failed')
  }

  return payload.data
}

export function createAdminHttpClient(runtime?: ApiRuntime) {
  return {
    get<TData>(path: string, query?: RequestOptions['query']) {
      return request<TData>(runtime, path, { query })
    },
    post<TData>(path: string, body?: unknown) {
      return request<TData>(runtime, path, { method: 'POST', body })
    },
    patch<TData>(path: string, body?: unknown) {
      return request<TData>(runtime, path, { method: 'PATCH', body })
    },
    put<TData>(path: string, body?: unknown) {
      return request<TData>(runtime, path, { method: 'PUT', body })
    },
    delete<TData>(path: string, body?: unknown) {
      return request<TData>(runtime, path, { method: 'DELETE', body })
    }
  }
}
