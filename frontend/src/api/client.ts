export class ApiError extends Error {
  status: number
  constructor(status: number) {
    super(`Falha ao consultar a API (${status})`)
    this.status = status
  }
}

type RequestOptions = { method?: 'GET' | 'POST' | 'PUT'; body?: unknown; token?: string; signal?: AbortSignal }

export async function requestJson(path: string, options: RequestOptions = {}): Promise<unknown> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) headers.Authorization = `Bearer ${options.token}`
  const timeout = AbortSignal.timeout(12_000)
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
  try {
    const response = await fetch(path, {
      method: options.method ?? 'GET', headers, signal, credentials: 'omit', cache: 'no-store',
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
    if (!response.ok) throw new ApiError(response.status)
    return await response.json()
  } catch (error) {
    if (options.signal?.aborted || error instanceof ApiError) throw error
    throw new ApiError(0)
  }
}
