import type { ApiErrorResponse } from '~/utils/api-types'

export class ApiError extends Error {
  public errorCode: string
  public description: string
  public rawStatus: string

  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.errorCode = ''
    this.description = ''
    this.rawStatus = ''

    if (data && typeof data === 'object') {
      const err = data as ApiErrorResponse
      this.errorCode = err.error_code ?? ''
      this.description = err.description ?? ''
      this.rawStatus = err.status ?? ''
    }
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  responseType?: 'json' | 'blob' | 'text'
  timeout?: number
}

function getBaseUrl(): string {
  try {
    return useRuntimeConfig().public.apiBaseUrl as string
  } catch {
    return 'http://localhost:9000'
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, responseType = 'json', timeout = 30000 } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const isFormData = body instanceof FormData
    const baseUrl = getBaseUrl()

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: isFormData ? { ...headers } : { 'Content-Type': 'application/json', ...headers },
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!res.ok) {
      let errorData: unknown
      try {
        errorData = await res.json()
      } catch {
        errorData = await res.text().catch(() => undefined)
      }

      const err = (errorData ?? {}) as ApiErrorResponse
      const message = err.description || err.message || `HTTP ${res.status}`

      throw new ApiError(message, res.status, errorData)
    }

    if (responseType === 'blob') return (await res.blob()) as T
    if (responseType === 'text') return (await res.text()) as T
    return (await res.json()) as T
  } catch (e) {
    if (e instanceof ApiError) throw e
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ApiError('La solicitud excedió el tiempo de espera', 408)
    }
    throw new ApiError('Error de conexión con el servidor', 0)
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  get<T>(path: string) {
    return request<T>(path)
  },

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'POST', body })
  },

  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'PUT', body })
  },

  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'PATCH', body })
  },

  delete<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'DELETE' })
  },
}
