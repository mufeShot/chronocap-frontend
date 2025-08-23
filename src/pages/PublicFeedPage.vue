<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { api } from '../services/api'
import type { Capsule } from '../types'
import Icon from '../components/Icon_svgs.vue'

const publicCapsules = ref<Capsule[]>([])
const loading = ref(true)
const q = ref('')
const sort = ref<'new' | 'old'>('new')

onMounted(async () => {
  publicCapsules.value = await api.listPublicCapsules()
  loading.value = false
})

function timeLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Unlocked'
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const filtered = computed(() => {
  const items = publicCapsules.value.filter((c) =>
    [c.title, c.description].join(' ').toLowerCase().includes(q.value.toLowerCase()),
  )
  items.sort((a, b) =>
    sort.value === 'new'
      ? +new Date(b.createdAt) - +new Date(a.createdAt)
      : +new Date(a.createdAt) - +new Date(b.createdAt),
  )
  return items
})
</script>

<template>
  <section class="feed">
    <header class="feed-head">
      <div class="titles">
        <h1><Icon name="globe" :size="22" /> Public Capsules</h1>
        <p class="muted">Discover capsules that creators chose to share.</p>
      </div>
      <div class="actions">
        <div class="search">
          <Icon name="search" />
          <input v-model="q" type="search" placeholder="Search titles and descriptions..." />
        </div>
        <div class="seg">
          <button :class="{ active: sort === 'new' }" @click="sort = 'new'">Newest</button>
          <button :class="{ active: sort === 'old' }" @click="sort = 'old'">Oldest</button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="grid">
      <article class="card skeleton" v-for="i in 8" :key="i"></article>
    </div>

    <div v-else-if="!filtered.length" class="empty">
      <Icon name="sparkles" :size="28" />
      <p>No public capsules found.</p>
    </div>

    <div v-else class="grid">
      <article v-for="c in filtered" :key="c.id" class="card">
        <div class="thumb">
          <Icon name="photo" :size="22" />
        </div>
        <div class="meta">
          <h3 class="title">
            {{ c.title }}
            <span class="pill green" title="Public"><Icon name="globe" :size="14" /></span>
          </h3>
          <div class="row">
            <span class="row-item">
              <Icon name="calendar" :size="16" />
              {{ new Date(c.deliveryAt).toLocaleString() }}
            </span>
            <span class="row-item">
              <Icon
                :name="new Date(c.deliveryAt) > new Date() ? 'lock-closed' : 'lock-open'"
                :size="16"
              />
              {{ timeLeft(c.deliveryAt) }}
            </span>
          </div>
          <p class="desc">{{ c.description || 'No description.' }}</p>
        </div>
        <router-link class="open" :to="`/unlock/${c.secretKey}`">
          View <Icon name="arrow-right" :size="16" />
        </router-link>
      </article>
    </div>
  </section>
</template>

<style scoped>
.feed {
  max-width: 1100px;
  margin: 1rem auto;
  padding: 0 1rem 1.2rem;
}
.feed-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}
@media (max-width: 820px) {
  .feed-head {
    grid-template-columns: 1fr;
    align-items: start;
  }
}
.titles h1 {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}
.muted {
  color: var(--text-2);
  margin: 0.2rem 0 0;
}
.actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}
.search {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}
.search input {
  background: transparent;
  border: 0;
  color: var(--text-1);
  outline: none;
  min-width: 220px;
}
.seg {
  display: inline-flex;
  padding: 0.25rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}
.seg button {
  background: transparent;
  color: var(--text-2);
  border: 0;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.seg .active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-1);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}
.card {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.6rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.8rem;
  transition:
    transform 0.12s ease,
    border-color 0.2s ease,
    background 0.2s ease;
  overflow: hidden;
}
.card:hover {
  transform: translateY(-2px);
  background: var(--surface-hover);
  border-color: rgba(255, 255, 255, 0.16);
}
.card.skeleton {
  height: 160px;
  background: linear-gradient(90deg, #ffffff08, #ffffff18, #ffffff08);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.thumb {
  height: 46px;
  width: 46px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background:
    radial-gradient(60px 30px at 30% 20%, rgba(36, 208, 181, 0.35), transparent 70%),
    rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
}
.meta .title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}
.row {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  color: var(--text-2);
  margin-top: 0.15rem;
}
.row-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.desc {
  color: var(--text-2);
  margin: 0.35rem 0 0;
  min-height: 2.2em;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-1);
}
.pill.green {
  border-color: rgba(36, 208, 181, 0.35);
}

.open {
  justify-self: end;
  align-self: end;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  background: linear-gradient(135deg, var(--brand), #24d0b5);
  color: #08121f;
  padding: 0.45rem 0.7rem;
  border-radius: 10px;
  font-weight: 800;
  transition:
    transform 0.06s ease-in,
    filter 0.2s ease;
}
.open:active {
  transform: translateY(1px);
}
</style>
