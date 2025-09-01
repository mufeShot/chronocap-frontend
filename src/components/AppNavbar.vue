<template>
  <nav class="navbar">
    <div class="site-container">
      <div class="navbar-content">
        <router-link to="/" class="navbar-brand">
          Time Capsule
        </router-link>
        
        <div class="navbar-actions">
          <button @click="openAuthModal" class="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUi } from '../composables/useUi'

const { openAuthModal } = useUi()
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--surface);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--brand);
  text-decoration: none;
}

.btn-primary {
  background: var(--brand);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: var(--brand-2);
}
</style>