import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'
export interface Toast {
  id: number
  type: ToastType
  message: string
  timeout?: number
}

const toasts = ref<Toast[]>([])
let idSeq = 1

export function useToasts() {
  function addToast(message: string, type: ToastType = 'info', timeout = 3000) {
    const id = idSeq++
    const t: Toast = { id, type, message, timeout }
    toasts.value.push(t)
    if (timeout > 0) {
      setTimeout(() => removeToast(id), timeout)
    }
    return id
  }
  function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  return { toasts, addToast, removeToast }
}
