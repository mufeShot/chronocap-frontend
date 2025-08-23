<script setup lang="ts">
defineOptions({ name: 'AppToaster' })
import { useToasts } from '../composables/useToasts'
const { toasts, removeToast } = useToasts()
</script>

<template>
  <div class="toaster" aria-live="polite" aria-atomic="true">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type" role="status">
      <span class="msg">{{ t.message }}</span>
      <button class="x" @click="removeToast(t.id)" aria-label="Dismiss">×</button>
    </div>
  </div>
</template>

<style scoped>
.toaster {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2000;
  display: grid;
  gap: 8px;
  width: min(92vw, 360px);
}
.toast {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-1);
  backdrop-filter: blur(8px) saturate(120%);
}
.toast.success {
  border-color: rgba(16, 185, 129, 0.35);
}
.toast.error {
  border-color: rgba(239, 68, 68, 0.35);
}
.x {
  background: none;
  border: 0;
  color: var(--text-2);
  font-size: 18px;
  cursor: pointer;
}
</style>
