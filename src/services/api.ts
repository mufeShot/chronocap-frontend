import type { Capsule, CreateCapsuleInput } from '../types'
import { useAuth } from '../composables/useAuth'
import type { AuthUser } from '../composables/useAuth'
import { apiFetch } from './apiFetch'

// Resolve API base: use VITE_API_BASE if provided, else fall back to same origin (browser) or localhost for dev.
const API_BASE = (() => {
  const envBase = (import.meta as ImportMeta).env?.VITE_API_BASE
  if (envBase && envBase.trim()) return envBase.replace(/\/$/, '')
  if (typeof window !== 'undefined') return location.origin.replace(/\/$/, '')
  return 'http://localhost:3000'
})()

type CreateOpts = { onProgress?: (pct: number) => void }

interface AuthResponse {
  access_token: string
  refresh_token: string
  user: AuthUser
}

type RawUser = {
  id?: unknown
  email?: unknown
  name?: unknown
  [key: string]: unknown
}

function normalizeUser(raw: RawUser | null | undefined): AuthUser {
  return {
    id: String(raw?.id ?? ''),
    email: String(raw?.email ?? ''),
    name: typeof raw?.name === 'string' ? raw.name : undefined,
    // ... po potrebi dodatna polja
  }
}

// All mock/local storage logic removed; backend is now the single source of truth.

// Raw capsule shapes (partial) from backend
interface RawFileLike { name?: unknown; filename?: unknown; type?: unknown; mime?: unknown; size?: unknown }
interface RawCapsuleEnvelope { data?: unknown }
interface RawCapsule {
  id?: unknown; _id?: unknown; secretKey?: unknown; secret?: unknown;
  ownerEmail?: unknown; owner?: { email?: unknown }; user?: { email?: unknown }
  title?: unknown; description?: unknown; content?: unknown;
  deliveryAt?: unknown; unlockAt?: unknown; isPublic?: unknown;
  createdAt?: unknown; files?: unknown; images?: unknown
}

// Normalize backend capsule payload (which uses fields like unlockAt, content, images, etc.)
function normalizeCapsule(raw: RawCapsule): Capsule {
  const id = String(raw?.id ?? raw?._id ?? '')
  const secret = String(raw?.secretKey ?? raw?.secret ?? id)
  const deliveryAtSrc: string | number | Date = typeof raw?.deliveryAt === 'string' || typeof raw?.deliveryAt === 'number'
    ? (raw.deliveryAt as string | number)
    : (typeof raw?.unlockAt === 'string' || typeof raw?.unlockAt === 'number'
      ? (raw.unlockAt as string | number)
      : Date.now())
  const createdAtSrc: string | number | Date = typeof raw?.createdAt === 'string' || typeof raw?.createdAt === 'number'
    ? (raw.createdAt as string | number)
    : Date.now()
  // Map files / images -> CapsuleFileMeta[]
  let files: Capsule['files'] = []
  if (Array.isArray(raw?.files)) {
    files = (raw.files as unknown[]).map((f, i) => {
      if (f && typeof f === 'object') {
        const rf = f as RawFileLike
        const name = String(rf.name ?? rf.filename ?? `file_${i}`)
        return { name, type: String(rf.type ?? rf.mime ?? ''), size: Number(rf.size ?? 0) }
      }
      if (typeof f === 'string') {
        const parts = f.split('/')
        return { name: parts[parts.length - 1] || `file_${i}`, type: '', size: 0 }
      }
      return { name: `file_${i}`, type: '', size: 0 }
    })
  } else if (Array.isArray(raw?.images)) {
    files = (raw.images as unknown[]).map((f, i) => {
      if (f && typeof f === 'object') {
        const rf = f as RawFileLike
        const name = String(rf.name ?? rf.filename ?? `image_${i}`)
        return { name, type: String(rf.type ?? rf.mime ?? ''), size: Number(rf.size ?? 0) }
      }
      if (typeof f === 'string') {
        const parts = f.split('/')
        return { name: parts[parts.length - 1] || `image_${i}`, type: '', size: 0 }
      }
      return { name: `image_${i}`, type: '', size: 0 }
    })
  }
  const imageUrls: string[] | undefined = Array.isArray(raw?.images)
    ? (raw!.images as unknown[]).filter(v => typeof v === 'string') as string[]
    : undefined
  return {
    id,
    ownerEmail: String(raw?.ownerEmail ?? raw?.owner?.email ?? raw?.user?.email ?? ''),
    title: String(raw?.title ?? ''),
    description: String(raw?.description ?? raw?.content ?? ''),
    deliveryAt: new Date(deliveryAtSrc).toISOString(),
    isPublic: !!raw?.isPublic,
    secretKey: secret,
    unlockUrl: `${location.origin}/unlock/${secret}`,
    createdAt: new Date(createdAtSrc).toISOString(),
    files,
    imageUrls,
  }
}
function extractCapsuleArray(payload: unknown): RawCapsule[] {
  if (Array.isArray(payload)) return payload as RawCapsule[]
  if (payload && typeof payload === 'object') {
    const env = payload as RawCapsuleEnvelope
    if (Array.isArray(env.data)) return env.data as RawCapsule[]
  }
  return []
}

async function postJSON<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  let data: unknown = null
  try { data = await res.json() } catch { }
  const getStrField = (obj: unknown, key: string): string | undefined => {
    if (typeof obj === 'object' && obj !== null && key in obj) {
      const v = (obj as Record<string, unknown>)[key]
      return typeof v === 'string' ? v : undefined
    }
    return undefined
  }
  if (!res.ok) {
    const msg = getStrField(data, 'message') || getStrField(data, 'error') || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data as T
}

export const api = {
  // Auth
  login(email: string, password: string) {
    return postJSON<AuthResponse>('/auth/login', { email, password }).then(r => ({
      ...r,
      user: normalizeUser(r.user),
    }))
  },
  register(email: string, password: string, name?: string) {
    return postJSON<AuthResponse>('/auth/register', { email, password, name }).then(r => ({
      ...r,
      user: normalizeUser(r.user),
    }))
  },
  refresh(userId: string, refresh_token: string) {
    return postJSON<{ access_token: string; refresh_token?: string; user?: unknown }>(
      '/auth/refresh',
      { userId, refresh_token },
    )
  },
  async logout(access_token: string) {
    try {
      await postJSON('/auth/logout', { access_token }, access_token)
    } catch {
      // ignore errors
    }
  },

  // Capsule features (backend only)
  async createCapsule(input: CreateCapsuleInput, opts: CreateOpts = {}): Promise<Capsule> {
    const auth = useAuth()
    if (!auth.accessToken.value) throw new Error('Not authenticated')
    const hasFiles = (input.files || []).length > 0
    let cap: Capsule
    if (hasFiles) {
      const form = new FormData()
      form.append('title', input.title)
      form.append('unlockAt', input.deliveryAt) // backend expects unlockAt
      if (input.description) form.append('content', input.description)
      form.append('isPublic', String(!!input.isPublic))
        ; (input.files || []).forEach(f => form.append('images', f, f.name))
      const xhr = new XMLHttpRequest()
      const promise = new Promise<RawCapsule>((resolve, reject) => {
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            opts.onProgress?.(pct)
          }
        }
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText) as RawCapsule
                resolve(data)
              } catch {
                reject(new Error('Invalid server response'))
              }
            } else {
              reject(new Error(`Create failed (${xhr.status})`))
            }
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', `${API_BASE}/capsules`)
        xhr.setRequestHeader('Authorization', `Bearer ${auth.accessToken.value}`)
        xhr.send(form)
      })
      const raw = await promise
      cap = normalizeCapsule(raw)
      opts.onProgress?.(100)
    } else {
      opts.onProgress?.(10)
      const res = await fetch(`${API_BASE}/capsules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.accessToken.value}`,
        },
        body: JSON.stringify({
          title: input.title,
          content: input.description || '',
          isPublic: !!input.isPublic,
          unlockAt: input.deliveryAt,
        }),
      })
      if (!res.ok) {
        let msg = `Create failed (${res.status})`
        try {
          const body: unknown = await res.json()
          if (body && typeof body === 'object' && 'message' in body) {
            const rec = body as Record<string, unknown>
            const val = rec.message
            if (typeof val === 'string') msg = val
          }
        } catch { }
        throw new Error(msg)
      }
      const raw: unknown = await res.json().catch(() => null)
      if (!raw || typeof raw !== 'object') throw new Error('Invalid server response')
      cap = normalizeCapsule(raw as RawCapsule)
      opts.onProgress?.(100)
    }
    // Ensure unlockUrl exists (fallback client construction if backend omits it but returns secretKey)
    if (!cap.unlockUrl && cap.secretKey) {
      const patched: Capsule & { unlockUrl: string } = { ...cap, unlockUrl: `${location.origin}/unlock/${cap.secretKey}` }
      return patched
    }
    return cap as Capsule
  },
  async listMyCapsules(): Promise<Capsule[]> {
    const auth = useAuth()
    if (!auth.accessToken.value) throw new Error('Not authenticated')
    const res = await fetch(`${API_BASE}/capsules`, {
      headers: { Authorization: `Bearer ${auth.accessToken.value}` },
    })
    if (!res.ok) throw new Error('Failed to fetch capsules')
    const data: unknown = await res.json().catch(() => [])
    const arr = extractCapsuleArray(data)
    return arr.map(normalizeCapsule)
  },
  async listPublicCapsules(): Promise<Capsule[]> {
    const res = await fetch(`${API_BASE}/public/capsules`)
    if (!res.ok) throw new Error('Failed to fetch public capsules')
    const data: unknown = await res.json().catch(() => [])
    const arr = extractCapsuleArray(data)
    return arr.map(normalizeCapsule)
  },
  async getCapsuleBySecret(key: string): Promise<Capsule | null> {
    const auth = useAuth()
    const hasToken = !!auth.accessToken.value
    const isNumericId = /^[0-9]+$/.test(key)

    // Helper to fetch with optional auth
    const doFetch = async (path: string, needsAuth: boolean) => {
      try {
        const res = await fetch(`${API_BASE}${path}`, {
          headers: needsAuth && hasToken ? { Authorization: `Bearer ${auth.accessToken.value}` } : undefined,
        })
        if (res.status === 404) return null
        if (res.status === 401 && needsAuth) return null
        if (!res.ok) return null
        const data: unknown = await res.json().catch(() => null)
        if (data && typeof data === 'object') return normalizeCapsule(data as RawCapsule)
      } catch { /* ignore */ }
      return null
    }

    if (isNumericId) {
      // Call private first if we have a token; only fallback to public on 404.
      if (hasToken) {
        // Private first
        const res = await apiFetch(`${API_BASE}/capsules/${encodeURIComponent(key)}`, { retryOn401: true })
        if (res.status === 404) {
          let notFoundMsg = 'Capsule not found'
          try {
            const body: unknown = await res.json()
            if (body && typeof body === 'object' && 'message' in body) {
              const rec = body as Record<string, unknown>
              const val = rec.message
              if (typeof val === 'string') notFoundMsg = val
            }
          } catch { }
          // fallback public
          const pub = await doFetch(`/public/capsules/${encodeURIComponent(key)}`, false)
          if (pub) return pub
          throw new Error(notFoundMsg)
        }
        if (res.status === 403) {
          let body: unknown = null
          try { body = await res.json() } catch { }
          if (body && typeof body === 'object' && 'message' in body) {
            const msgVal = (body as Record<string, unknown>).message
            if (typeof msgVal === 'string') throw new Error(msgVal)
          }
          throw new Error('Forbidden')
        }
        if (res.ok) {
          const data: unknown = await res.json().catch(() => null)
          if (data && typeof data === 'object') return normalizeCapsule(data as RawCapsule)
        }
        return null
      } else {
        // No token: only attempt public endpoint
        const pub = await doFetch(`/public/capsules/${encodeURIComponent(key)}`, false)
        if (pub) return pub
        return null
      }
    }

    // Non-numeric: treat as secret key; try public secret route if exists, then private.
    const pubSecret = await doFetch(`/public/capsules/secret/${encodeURIComponent(key)}`, false)
    if (pubSecret) return pubSecret
    if (hasToken) {
      const privSecret = await doFetch(`/capsules/secret/${encodeURIComponent(key)}`, true)
      if (privSecret) return privSecret
    }
    return null
  },
}
