<script setup lang="ts">
defineProps<{
  name:
    | 'calendar'
    | 'globe'
    | 'lock-closed'
    | 'lock-open'
    | 'document'
    | 'upload'
    | 'photo'
    | 'video'
    | 'clock'
    | 'sparkles'
    | 'user'
    | 'arrow-right'
    | 'eye'
    | 'search'
  | 'download'
  size?: number
}>()
</script>

<template>
  <svg
    :width="size || 20"
    :height="size || 20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2"></rect>
      <path d="M16 2v4M8 2v4M3 10h18"></path>
    </template>
    <template v-else-if="name === 'globe'">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"></path>
    </template>
    <template v-else-if="name === 'lock-closed'">
      <rect x="5" y="11" width="14" height="10" rx="2"></rect>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
    </template>
    <template v-else-if="name === 'lock-open'">
      <rect x="5" y="11" width="14" height="10" rx="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0"></path>
    </template>
    <template v-else-if="name === 'document'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8z"></path>
      <path d="M14 2v6h6"></path>
    </template>
    <template v-else-if="name === 'upload'">
      <path d="M12 16V4"></path>
      <path d="M7 9l5-5 5 5"></path>
      <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"></path>
    </template>
    <template v-else-if="name === 'photo'">
      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
      <circle cx="8.5" cy="10.5" r="1.5"></circle>
      <path d="M21 15l-5-5L5 21"></path>
    </template>
    <template v-else-if="name === 'video'">
      <rect x="3" y="5" width="15" height="14" rx="2"></rect>
      <path d="M22 7l-4 3v4l4 3z"></path>
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 6v6l4 2"></path>
    </template>
    <template v-else-if="name === 'sparkles'">
      <path d="M5 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" transform="translate(7 1) scale(.6)"></path>
      <path d="M12 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" transform="translate(1 9) scale(.6)"></path>
    </template>
    <template v-else-if="name === 'user'">
      <path d="M20 21a8 8 0 1 0-16 0"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12h14"></path>
      <path d="M12 5l7 7-7 7"></path>
    </template>
    <template v-else-if="name === 'eye'">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7"></circle>
      <path d="M21 21l-4.3-4.3"></path>
    </template>
    <template v-else-if="name === 'download'">
      <path d="M12 4v12"></path>
      <path d="M7 11l5 5 5-5"></path>
      <path d="M20 20v0a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v0"></path>
    </template>
  </svg>
</template>
