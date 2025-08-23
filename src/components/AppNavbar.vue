<script setup lang="ts">
defineOptions({ name: 'AppNavbar' })
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useUi } from '../composables/useUi'
import { api } from '../services/api'

const router = useRouter()
const { isLoggedIn, userEmail, logout, accessToken } = useAuth()
const { openAuthModal } = useUi()

async function handleLogout() {
  if (accessToken.value) {
    try {
      await api.logout(accessToken.value)
    } catch {}
  }
  logout()
  router.push('/')
}
function handleHome() {
  router.push('/')
}
function openLogin() {
  openAuthModal(null)
}
</script>

<template>
  <header class="nav-wrap">
    <nav class="navbar site-container">
      <div class="nav-left" @click="handleHome">
        <img src="../assets/just_logo.png" alt="Chronocap logo" class="nav-logo" />
        <span class="nav-title">Chronocap</span>
      </div>
      <div class="nav-right">
        <router-link class="nav-link" to="/">Home</router-link>
        <router-link class="nav-link" to="/public">Public</router-link>
        <router-link v-if="isLoggedIn" class="nav-link" to="/dashboard">Dashboard</router-link>

        <template v-if="!isLoggedIn">
          <button class="nav-btn" @click="openLogin">Login / Register</button>
        </template>
        <template v-else>
          <span class="user-email">{{ userEmail }}</span>
          <button class="nav-btn" @click="handleLogout">Logout</button>
        </template>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.nav-wrap {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: saturate(140%) blur(10px);
  background: linear-gradient(180deg, rgba(10, 17, 30, 0.75), rgba(10, 17, 30, 0.35));
  border-bottom: 1px solid var(--border);
}
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
}
.nav-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}
.nav-logo {
  height: 34px;
  border-radius: 6px;
}
.nav-title {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text-1);
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.nav-link {
  color: var(--text-2);
  text-decoration: none;
  transition: color 0.2s ease;
}
.nav-link.router-link-active,
.nav-link:hover {
  color: var(--text-1);
}
.nav-btn {
  background: var(--brand);
  color: white;
  border: 0;
  padding: 0.48rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition:
    background 0.2s ease,
    transform 0.05s ease-in;
}
.nav-btn:hover {
  background: var(--brand-2);
}
.nav-btn:active {
  transform: translateY(1px);
}
.user-email {
  color: var(--text-2);
  font-weight: 500;
  margin-right: 0.2rem;
}
</style>
