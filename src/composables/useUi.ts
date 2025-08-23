import { ref } from 'vue'

const authModalOpen = ref(false)
const authRedirectPath = ref<string | null>(null)

function openAuthModal(redirectTo?: string | null) {
  if (redirectTo) authRedirectPath.value = redirectTo
  authModalOpen.value = true
}
function closeAuthModal() {
  authModalOpen.value = false
}
function clearAuthRedirect() {
  authRedirectPath.value = null
}

export function useUi() {
  return { authModalOpen, authRedirectPath, openAuthModal, closeAuthModal, clearAuthRedirect }
}
