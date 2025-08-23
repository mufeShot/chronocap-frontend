<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
import LoginModal from './components/LoginModal.vue'
import Toaster from './components/Toaster.vue'
import { useUi } from './composables/useUi'
const { authModalOpen, closeAuthModal } = useUi()
</script>

<template>
  <AppNavbar />
  <main class="site-main">
    <div class="site-container">
      <router-view />
    </div>
  </main>

  <LoginModal v-if="authModalOpen" @close="closeAuthModal" />
  <Toaster />
</template>
