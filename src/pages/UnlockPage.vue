<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api'
import type { Capsule } from '../types'

const route = useRoute()
const capsule = ref<Capsule | null>(null)
const errorMsg = ref<string | null>(null)
const loading = ref(true)
const now = ref(Date.now())
let timer: number | null = null

const isUnlocked = computed(() => {
  if (!capsule.value) return false
  return now.value >= new Date(capsule.value.deliveryAt).getTime()
})

function formatDate(iso: string | Date | number) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return String(iso)
  }
}

const unlockedLabel = computed(() => (isUnlocked.value ? 'Unlocked on' : 'Unlocks on'))
const unlockedValue = computed(() => capsule.value ? formatDate(capsule.value.deliveryAt) : '')
const createdValue = computed(() => capsule.value ? formatDate(capsule.value.createdAt) : '')
const hasImages = computed(() => !!(capsule.value && capsule.value.imageUrls && capsule.value.imageUrls.length))
const imageCount = computed(() => (capsule.value?.imageUrls?.length) || 0)

const countdown = computed(() => {
  if (!capsule.value) return null
  const diff = Math.max(0, new Date(capsule.value.deliveryAt).getTime() - now.value)
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return { d, h, m, s: sec }
})

onMounted(async () => {
  const secret = route.params.secret as string
  try {
    capsule.value = await api.getCapsuleBySecret(secret)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Unable to load capsule.'
  }
  loading.value = false
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <section class="unlock">
    <div v-if="loading">Loading...</div>
    <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-else-if="!capsule">Invalid or unknown secret.</div>
    <div v-else class="capsule-card" :class="{ locked: !isUnlocked }">
      <div class="media" v-if="hasImages">
        <div v-if="capsule.imageUrls && capsule.imageUrls.length === 1" class="hero-single">
          <img :src="capsule.imageUrls![0]" :alt="capsule.title" loading="lazy" />
        </div>
  <div v-else-if="capsule.imageUrls && capsule.imageUrls.length > 1" class="hero-grid">
          <div class="hero-main">
            <img :src="capsule.imageUrls![0]" :alt="capsule.title + ' main image'" loading="lazy" />
          </div>
          <div class="thumbs">
            <a
              v-for="(url,i) in capsule.imageUrls!.slice(1)"
              :key="url + i"
              :href="url" target="_blank" rel="noopener"
              class="thumb"
            >
              <img :src="url" :alt="capsule.title + ' image ' + (i+2)" loading="lazy" />
            </a>
          </div>
        </div>
        <div v-if="imageCount > 1" class="img-count-badge">{{ imageCount }} images</div>
      </div>

      <header class="header">
        <h1 class="title">{{ capsule.title }}</h1>
        <div class="meta">
          <span class="chip" :class="{ success: isUnlocked }">{{ isUnlocked ? 'Unlocked' : 'Locked' }}</span>
          <span class="chip user">{{ capsule.ownerEmail }}</span>
        </div>
      </header>

      <div class="dates">
        <div class="date-item">
          <span class="label">Created</span>
          <span class="value">{{ createdValue }}</span>
        </div>
        <div class="date-item">
          <span class="label">{{ unlockedLabel }}</span>
          <span class="value">{{ unlockedValue }}</span>
        </div>
      </div>

      <div class="body" v-if="capsule.description">
        <p class="description" v-text="capsule.description" />
      </div>

  <div v-if="isUnlocked && !hasImages" class="no-images">No images attached.</div>

      <div v-if="!isUnlocked" class="unlock-hint">
        <p class="hint-text">This capsule is still locked. Time remaining:</p>
        <div v-if="countdown" class="countdown">
          <div class="cell"><strong>{{ countdown.d }}</strong><span>d</span></div>
          <div class="cell"><strong>{{ countdown.h }}</strong><span>h</span></div>
            <div class="cell"><strong>{{ countdown.m }}</strong><span>m</span></div>
          <div class="cell"><strong>{{ countdown.s }}</strong><span>s</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Layout container */
.unlock { max-width: 980px; margin: 2rem auto; padding: 0 1.2rem 3rem; }
.capsule-card { position: relative; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); backdrop-filter: blur(14px) saturate(140%); -webkit-backdrop-filter: blur(14px) saturate(140%); padding: 1.6rem 1.6rem 2rem; box-shadow: 0 4px 30px -8px rgba(0,0,0,0.35); }
.capsule-card.locked { border-style: dashed; }
.header { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1.2rem; }
.title { margin: 0; font-size: clamp(1.8rem, 4vw, 2.35rem); line-height: 1.15; letter-spacing: .5px; }
.meta { display: flex; flex-wrap: wrap; gap: .5rem; }
.chip { font-size: .7rem; text-transform: uppercase; letter-spacing: 1px; background: rgba(255,255,255,0.08); border: 1px solid var(--border); padding: .35rem .6rem; border-radius: 999px; font-weight: 600; color: var(--text-2); backdrop-filter: blur(3px); }
.chip.success { background: linear-gradient(90deg,#3fbf6d,#2b7f4a); color: #fff; border-color: #2a6b43; }
.chip.user { background: rgba(64,140,255,0.18); border-color: rgba(64,140,255,0.35); color: #fff; }

/* Media */
.media { margin: -1.6rem -1.6rem 1.4rem; }
.hero-single img, .hero-main img { width: 100%; height: clamp(220px,38vh,420px); object-fit: cover; display: block; }
.hero-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 6px; }
.hero-main { overflow: hidden; border-top-left-radius: 18px; }
.hero-grid .hero-main img { border-top-left-radius: 18px; }
.thumbs { display: grid; grid-template-columns: 1fr; gap: 6px; }
.thumb { display: block; position: relative; overflow: hidden; }
.thumb img { width: 100%; height: calc((clamp(220px,38vh,420px) - 6px)/2); object-fit: cover; display: block; }
.hero-single img { border-top-left-radius: 18px; border-top-right-radius: 18px; }
.img-count-badge { position: absolute; top: .75rem; right: .75rem; background: rgba(0,0,0,0.55); color: #fff; padding: .35rem .6rem; font-size: .65rem; letter-spacing: .5px; border-radius: 999px; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.15); }

/* Dates */
.dates { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: .9rem; margin-bottom: 1.4rem; }
.date-item { background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 14px; padding: .75rem .9rem; min-height: 72px; display: flex; flex-direction: column; justify-content: center; }
.date-item .label { font-size: .65rem; text-transform: uppercase; letter-spacing: 1.1px; color: var(--text-2); margin-bottom: .25rem; }
.date-item .value { font-size: .85rem; font-weight: 500; color: var(--text-1); line-height: 1.2; word-break: break-word; }

/* Body */
.body { line-height: 1.6; }
.description { white-space: pre-wrap; margin: 0; font-size: .95rem; color: var(--text-1); }
.no-images { margin-top: 1.4rem; font-size: .75rem; letter-spacing: .7px; text-transform: uppercase; color: var(--text-2); opacity: .85; background: rgba(255,255,255,0.04); border: 1px dashed var(--border); padding: .75rem 1rem; border-radius: 12px; text-align: center; }

/* Locked hint / countdown */
.unlock-hint { margin-top: 1.8rem; padding: 1.1rem 1rem 1.3rem; border: 1px solid var(--border); border-radius: 16px; background: rgba(255,255,255,0.04); }
.hint-text { margin: 0 0 .8rem; font-size: .8rem; color: var(--text-2); letter-spacing: .5px; }
.countdown { display: inline-flex; gap: .6rem; }
.cell { background: rgba(255,255,255,0.08); border: 1px solid var(--border); border-radius: 10px; padding: .55rem .65rem .5rem; text-align: center; min-width: 46px; }
.cell strong { font-size: .95rem; display: block; line-height: 1.1; }
.cell span { color: var(--text-2); font-size: .6rem; text-transform: uppercase; letter-spacing: .6px; }

/* Status & errors */
.error {
  padding: 1rem;
  border: 1px solid #d55;
  background: rgba(220, 80, 80, 0.08);
  border-radius: 10px;
  color: #f88;
}
</style>
