import type { ApiResponse, ApiRuntime } from '@saasbase/api-client'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | null | undefined>
  body?: unknown
  headers?: Record<string, string>
}

function buildUrl(baseUrl: string | undefined, path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, baseUrl ?? 'http://localhost')

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === '') {
      continue
    }

    url.searchParams.set(key, String(value))
  }

  return baseUrl ? url.toString() : `${url.pathname}${url.search}`
}

async function request<TData>(runtime: ApiRuntime | undefined, path: string, options: RequestOptions = {}): Promise<TData> {
  const response = await fetch(buildUrl(runtime?.baseUrl, path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...runtime?.headers,
      ...options.headers
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
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
    delete<TData>(path: string, body?: unknown) {
      return request<TData>(runtime, path, { method: 'DELETE', body })
    }
  }
}
