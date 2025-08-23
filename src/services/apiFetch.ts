import { useAuth } from '../composables/useAuth'

interface FetchOpts extends RequestInit {
  retryOn401?: boolean
}

let refreshInFlight: Promise<void> | null = null

async function ensureRefreshed() {
  const auth = useAuth()
  if (!refreshInFlight) {
    refreshInFlight = auth.refreshAccessToken().catch(e => {
      auth.logout()
      throw e
    }).finally(() => { refreshInFlight = null })
  }
  return refreshInFlight
}

export async function apiFetch(input: string, opts: FetchOpts = {}) {
  const auth = useAuth()
  const doReq = () => {
    const headers: HeadersInit = {
      ...(opts.headers || {}),
      ...(auth.accessToken.value ? { Authorization: `Bearer ${auth.accessToken.value}` } : {}),
    }
    return fetch(input, { ...opts, headers })
  }

  let res = await doReq()
  if (res.status === 401 && opts.retryOn401 !== false && auth.refreshToken.value) {
    try {
      await ensureRefreshed()
      res = await doReq()
    } catch {
      // refresh failed; logout already handled
      return res
    }
  }
  return res
}

interface ApiErrorData {
  message?: string
  error?: string
}

function isApiErrorData(value: unknown): value is ApiErrorData {
  if (typeof value !== 'object' || value === null) return false
  const rec = value as Record<string, unknown>
  return typeof rec.message === 'string' || typeof rec.error === 'string'
}

export async function apiJson<T>(input: string, opts: FetchOpts = {}) {
  const res = await apiFetch(input, opts)
  let data: unknown = null
  try { data = await res.json() } catch { }
  if (!res.ok) {
    const msg = isApiErrorData(data)
      ? (data.message || data.error || `HTTP ${res.status}`)
      : `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data as T
}
