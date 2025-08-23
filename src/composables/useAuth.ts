import { ref, computed } from 'vue'
import { api } from '../services/api'

/** Shape of user object returned by backend (extend as needed) */
export interface AuthUser {
  id: string
  email: string
  name?: string
  [k: string]: unknown
}

const accessToken = ref<string | null>(null) // in‑memory only
const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
const user = ref<AuthUser | null>(loadPersistedUser())

function loadPersistedUser(): AuthUser | null {
  const raw = localStorage.getItem('auth_user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

const isLoggedIn = computed(() => !!accessToken.value && !!user.value)
const userEmail = computed(() => user.value?.email || '')

function persist() {
  if (refreshToken.value) localStorage.setItem('refresh_token', refreshToken.value)
  else localStorage.removeItem('refresh_token')
  if (user.value) localStorage.setItem('auth_user', JSON.stringify(user.value))
  else localStorage.removeItem('auth_user')
}

function setAuth(newAccess: string, newRefresh: string | null, newUser: AuthUser) {
  accessToken.value = newAccess
  if (newRefresh) refreshToken.value = newRefresh
  user.value = newUser
  persist()
}

function logout() {
  accessToken.value = null
  refreshToken.value = null
  user.value = null
  persist()
}

let refreshing: Promise<void> | null = null
async function refreshAccessToken() {
  if (!refreshToken.value || !user.value) throw new Error('No refresh token')
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const r = await api.refresh(user.value!.id, refreshToken.value!)
        // API returns possibly rotated refresh token & (optionally) user
        // Cast r.user to AuthUser (if present) to satisfy typing; fall back to existing user.
        setAuth(r.access_token, r.refresh_token || refreshToken.value, (r.user as AuthUser | undefined) ?? user.value!)
      } catch (e) {
        logout()
        throw e
      } finally {
        refreshing = null
      }
    })()
  }
  return refreshing
}

/** Silent refresh on app start if we only have refresh token */
async function initAuth() {
  if (refreshToken.value && !accessToken.value) {
    try {
      await refreshAccessToken()
    } catch {
      // ignore (user stays logged out)
    }
  }
}

function authHeaders() {
  return accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
}

export function useAuth() {
  return {
    // state
    accessToken,
    refreshToken,
    user,
    userEmail,
    isLoggedIn,
    // actions
    setAuth,
    logout,
    refreshAccessToken,
    initAuth,
    // helpers
    authHeaders,
  }
}
