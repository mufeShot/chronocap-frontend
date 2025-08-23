<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useUi } from '../composables/useUi'

const router = useRouter()
const { isLoggedIn } = useAuth()
const { openAuthModal } = useUi()

function goDashboard() {
  router.push('/dashboard')
}
function openLogin() {
  openAuthModal(null)
}
</script>

<template>
  <section class="hero">
    <div class="hero-grid">
      <div class="hero-media">
        <div class="logo-card">
          <img src="../assets/logo.png" alt="Chronocap full logo" />
        </div>
      </div>
      <div class="hero-copy">
        <h1>Capture now. Revisit later.</h1>
        <p class="subtitle">
          Create digital time capsules: upload memories, choose a future date, and let Chronocap
          deliver them back. Get a PDF with a secret link as a resilient fallback.
        </p>
        <div class="cta">
          <button v-if="!isLoggedIn" class="cta-btn" @click="openLogin">Get Started</button>
          <button v-else class="cta-btn" @click="goDashboard">Go to Dashboard</button>
        </div>
      </div>
    </div>
  </section>

  <section class="features">
    <div class="grid">
      <article class="card">
        <img src="../assets/no_logo_clear_bg.png" alt="" class="mini" />
        <h3>Upload memories</h3>
        <p>Photos and videos in one capsule.</p>
      </article>
      <article class="card">
        <img src="../assets/no_logo_clear_bg.png" alt="" class="mini" />
        <h3>Future delivery</h3>
        <p>We deliver on your chosen date.</p>
      </article>
      <article class="card">
        <img src="../assets/no_logo_clear_bg.png" alt="" class="mini" />
        <h3>Resilient access</h3>
        <p>PDF with secret link as a backup.</p>
      </article>
      <article class="card">
        <img src="../assets/no_logo_clear_bg.png" alt="" class="mini" />
        <h3>Public capsules</h3>
        <p>Opt-in to share with the world.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 1rem 0 2rem;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 2rem;
  align-items: center;
}
@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
.logo-card {
  background:
    radial-gradient(300px 180px at 40% 30%, rgba(255, 255, 255, 0.08), transparent 70%),
    var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  display: grid;
  place-items: center;
  min-height: 280px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
.logo-card img {
  width: 240px;
  max-width: 100%;
  border-radius: 12px;
}

.hero-copy h1 {
  font-size: clamp(2rem, 3.5vw, 3rem);
  line-height: 1.1;
  margin: 0 0 0.6rem 0;
}
.subtitle {
  color: var(--text-2);
  max-width: 56ch;
}
.cta {
  margin-top: 1.2rem;
}
.cta-btn {
  background: linear-gradient(135deg, var(--brand), #24d0b5);
  color: #08121f;
  border: 0;
  padding: 0.9rem 1.6rem;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.06s ease-in,
    filter 0.2s ease;
  box-shadow: 0 8px 22px rgba(16, 185, 129, 0.25);
}
.cta-btn:hover {
  filter: brightness(1.05);
}
.cta-btn:active {
  transform: translateY(1px);
}

.features {
  padding: 1rem 0 3rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 1000px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  transition:
    transform 0.1s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}
.card:hover {
  background: var(--surface-hover);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.16);
}
.card h3 {
  margin: 0.2rem 0 0.2rem;
}
.card p {
  color: var(--text-2);
  margin: 0;
}
.mini {
  width: 40px;
  opacity: 0.9;
}
</style>
