<script setup lang="ts">
defineProps<{ value: number; label?: string }>()
</script>

<template>
  <div class="bar" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100">
    <div class="fill" :style="{ width: Math.max(0, Math.min(100, value)) + '%' }" />
    <span v-if="label" class="label">{{ label }} ({{ Math.round(value) }}%)</span>
  </div>
</template>

<style scoped>
.bar {
  position: relative;
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, #1abc9c, #24d0b5);
  transition: width 0.2s ease;
}
.label {
  position: absolute;
  top: -24px;
  right: 0;
  font-size: 12px;
  color: var(--text-2);
}
</style>
