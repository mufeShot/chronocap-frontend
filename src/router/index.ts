import { createRouter, createWebHistory } from 'vue-router'
import { useUi } from '../composables/useUi'
import { useAuth } from '../composables/useAuth'

const LandingPage = () => import('../pages/LandingPage.vue')
const DashboardPage = () => import('../pages/DashboardPage.vue')
const PublicFeedPage = () => import('../pages/PublicFeedPage.vue')
const UnlockPage = () => import('../pages/UnlockPage.vue')
const NotFound = () => import('../pages/NotFound.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: LandingPage },
    { path: '/public', name: 'public', component: PublicFeedPage },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true },
    },
    { path: '/unlock/:secret', name: 'unlock', component: UnlockPage, props: true },
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const auth = useAuth()
  if (!auth.isLoggedIn.value && auth.refreshToken.value) {
    try { await auth.refreshAccessToken() } catch { /* ignore */ }
  }
  if (!auth.isLoggedIn.value) {
    const { openAuthModal } = useUi()
    openAuthModal(to.fullPath)
    return { path: '/' }
  }
  return true
})

export default router
