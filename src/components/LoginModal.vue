<template>
  <div class="modal-overlay" @click.self="onCloseOverlay">
    <div class="modal-wrap" ref="wrapRef">
      <div class="modal-backplate" aria-hidden="true"></div>
      <div
        class="modal-card"
        ref="cardRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button class="close-x" aria-label="Close" @click="emit('close')">×</button>

        <div class="card-head">
          <img src="../assets/just_logo.png" alt="" class="brand" />
          <h2 id="auth-title">{{ isLoginMode ? 'Welcome back' : 'Create your account' }}</h2>
          <p class="muted">
            {{
              isLoginMode
                ? 'Log in to start creating time capsules.'
                : 'Join Chronocap and preserve your memories.'
            }}
          </p>
        </div>

        <div class="tabs" role="tablist">
          <span class="pill-indicator" :style="pillStyle" aria-hidden="true"></span>
          <button
            role="tab"
            :aria-selected="isLoginMode"
            class="tab"
            :class="{ active: isLoginMode }"
            @click="setMode(true)"
          >
            Login
          </button>
          <button
            role="tab"
            :aria-selected="!isLoginMode"
            class="tab"
            :class="{ active: !isLoginMode }"
            @click="setMode(false)"
          >
            Register
          </button>
        </div>

        <form class="form" @submit.prevent="handleAuth" novalidate>
          <label class="field">
            <span class="label">Email</span>
            <input
              v-model.trim="email"
              type="email"
              inputmode="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
            />
          </label>

          <label class="field">
            <span class="label">Password</span>
            <div class="with-action">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="••••••••"
              />
              <button class="ghost" type="button" @click="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </label>

          <div class="error-space">
            <p v-if="error" class="error" role="alert">{{ error }}</p>
          </div>

          <button class="submit" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
            {{
              isLoading
                ? isLoginMode
                  ? 'Logging in...'
                  : 'Creating account...'
                : isLoginMode
                  ? 'Login'
                  : 'Register'
            }}
          </button>

          <button class="switch" type="button" @click="isLoginMode = !isLoginMode">
            {{ isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../composables/useAuth'
import { useUi } from '../composables/useUi'
import { useToasts } from '../composables/useToasts'

const emit = defineEmits(['close'])
const { authRedirectPath, clearAuthRedirect } = useUi()
const { addToast } = useToasts()

const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const isLoading = ref(false)

const router = useRouter()
const { setAuth } = useAuth()

function setMode(login: boolean) {
  isLoginMode.value = login
  error.value = ''
}

const pillStyle = computed(() => ({
  transform: isLoginMode.value ? 'translateX(0%)' : 'translateX(100%)',
}))

// Focus trap + Esc + scroll lock
const cardRef = ref<HTMLElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)
let lastActive: Element | null = null
let untrap: (() => void) | null = null
let originalOverflow = ''

function trapFocus(container: HTMLElement) {
  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (!nodes.length) return () => {}
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      emit('close')
    } else if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
  container.addEventListener('keydown', onKey)
  first.focus()
  return () => container.removeEventListener('keydown', onKey)
}

function onCloseOverlay() {
  emit('close')
}

onMounted(async () => {
  lastActive = document.activeElement
  originalOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick()
  if (cardRef.value) {
    untrap = trapFocus(cardRef.value)
  }
})

onBeforeUnmount(() => {
  if (untrap) untrap()
  document.body.style.overflow = originalOverflow
  if (lastActive instanceof HTMLElement) {
    lastActive.focus()
  }
})

async function handleAuth() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  isLoading.value = true
  try {
    const resp = isLoginMode.value
      ? await api.login(email.value, password.value)
      : await api.register(email.value, password.value)
    // resp: { access_token, refresh_token, user }
    setAuth(resp.access_token, resp.refresh_token, resp.user)
    const target = authRedirectPath.value || '/dashboard'
    clearAuthRedirect()
    addToast(isLoginMode.value ? 'Logged in.' : 'Account created.', 'success')
    emit('close')
    router.push(target)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Authentication failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.92);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-wrap {
  position: relative;
  isolation: isolate;
}
.modal-backplate {
  position: absolute;
  inset: -16px;
  background: #0b1220;
  border-radius: 22px;
  filter: blur(6px);
  z-index: 0;
  pointer-events: none;
}
.modal-card {
  position: relative;
  z-index: 1;
  width: clamp(320px, 92vw, 440px);
  contain: inline-size;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.modal-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  pointer-events: none;
}
.close-x {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #9aa4b2;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.close-x:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.06);
}
.card-head {
  padding: 1.2rem 1.2rem 0.6rem;
  text-align: center;
  min-height: 112px;
}
.card-head .brand {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  margin-bottom: 0.4rem;
}
.card-head h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #e5e7eb;
}
.muted {
  color: #94a3b8;
  margin: 0.25rem 0 0.8rem;
}
.tabs {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0 1rem 0.9rem;
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  overflow: hidden;
}
.pill-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 8px);
  height: calc(100% - 8px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.tab {
  position: relative;
  z-index: 1;
  background: transparent;
  color: #94a3b8;
  border: 0;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}
.tab.active {
  color: #e5e7eb;
}
.form {
  display: grid;
  gap: 0.8rem;
  padding: 0 1rem 1.1rem;
  min-height: 230px;
}
.field {
  display: grid;
  gap: 0.4rem;
}
.label {
  color: #94a3b8;
  font-size: 0.9rem;
}
input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
input:focus {
  border-color: rgba(36, 208, 181, 0.55);
  box-shadow: 0 0 0 3px rgba(36, 208, 181, 0.15);
}
.with-action {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.4rem;
}
.ghost {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
  padding: 0.55rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
}
.ghost:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.08);
}
.error-space {
  min-height: 44px;
}
.error {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.35);
  color: #fecaca;
  padding: 0.55rem 0.7rem;
  border-radius: 10px;
  font-size: 0.95rem;
}
.submit {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #1abc9c, #24d0b5);
  color: #08121f;
  border: 0;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.06s ease-in,
    filter 0.2s ease,
    opacity 0.2s ease;
}
.submit:disabled {
  opacity: 0.7;
  cursor: default;
}
.submit:not(:disabled):active {
  transform: translateY(1px);
}
.switch {
  margin-top: 0.2rem;
  background: transparent;
  border: 0;
  color: #1abc9c;
  cursor: pointer;
  text-decoration: underline;
}
.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-top-color: rgba(0, 0, 0, 0.55);
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
