<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { api } from '../services/api'
import CapsuleForm from '../components/CapsuleForm.vue'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import type { Capsule } from '../types'
import Icon from '../components/Icon_svgs.vue'
import { useToasts } from '../composables/useToasts'

const { userEmail } = useAuth()
const { addToast } = useToasts()
const myCapsules = ref<Capsule[]>([])
const loading = ref(true)
const formEl = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (userEmail.value) {
    try {
      myCapsules.value = await api.listMyCapsules()
    } catch {
      // swallow for now; could show toast
    }
  }
  loading.value = false
})

const totalCount = computed(() => myCapsules.value.length)
const publicCount = computed(() => myCapsules.value.filter((c) => c.isPublic).length)
const upcomingCount = computed(
  () => myCapsules.value.filter((c) => new Date(c.deliveryAt) > new Date()).length,
)

function goToForm() {
  formEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function copyUnlock(c: Capsule) {
  const url = `${location.origin}/unlock/${c.secretKey}`
  navigator.clipboard.writeText(url).then(() => addToast('Link copied to clipboard', 'success'))
}

async function downloadPdf(c: Capsule) {
  try {
    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Chronocap — Capsule Access', 20, 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text(`Title: ${c.title}`, 20, 32)
    doc.text(`Unlock at: ${new Date(c.deliveryAt).toLocaleString()}`, 20, 40)
    doc.text('Use the QR or link after unlock time:', 20, 52)
    const qrDataUrl = await QRCode.toDataURL(c.unlockUrl, { margin: 1, scale: 6 })
    doc.addImage(qrDataUrl, 'PNG', 20, 60, 50, 50)
    doc.textWithLink(c.unlockUrl, 20, 120, { url: c.unlockUrl })
    doc.text(`Secret: ${c.secretKey}`, 20, 130)
    doc.save(`chronocap-${c.id}.pdf`)
    addToast('PDF downloaded.', 'success', 2500)
  } catch {
    addToast('Failed to generate PDF', 'error')
  }
}

function onCreated(c: Capsule) {
  myCapsules.value.unshift(c) // show at top
}
</script>

<template>
  <section class="dashboard">
    <header class="dash-head">
      <div class="titles">
        <h1><Icon name="user" :size="22" /> Dashboard</h1>
        <p class="muted">Manage your capsules and create new ones.</p>
      </div>
      <button class="primary" @click="goToForm">
        <Icon name="upload" :size="18" /> New Capsule
      </button>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="icon"><Icon name="document" :size="20" /></div>
        <div class="value">{{ totalCount }}</div>
        <div class="label">Total</div>
      </div>
      <div class="stat-card">
        <div class="icon green"><Icon name="globe" :size="20" /></div>
        <div class="value">{{ publicCount }}</div>
        <div class="label">Public</div>
      </div>
      <div class="stat-card">
        <div class="icon"><Icon name="clock" :size="20" /></div>
        <div class="value">{{ upcomingCount }}</div>
        <div class="label">Upcoming</div>
      </div>
    </div>

    <div ref="formEl">
      <CapsuleForm @created="onCreated" />
    </div>

    <div class="list">
      <h2>My Capsules</h2>
      <div v-if="loading" class="skeleton-list">
        <div class="skeleton" v-for="i in 3" :key="i"></div>
      </div>
      <div v-else-if="!myCapsules.length" class="empty">
        <Icon name="sparkles" :size="28" />
        <p>No capsules yet. Create your first one!</p>
      </div>
      <ul v-else class="caps-list">
        <li v-for="c in myCapsules" :key="c.id" class="caps-item">
          <div class="left">
            <div class="badge" :class="{ pub: c.isPublic }">
              <Icon :name="c.isPublic ? 'globe' : 'lock-closed'" :size="14" />
            </div>
            <div>
              <strong class="title">{{ c.title }}</strong>
              <div class="meta">
                <span class="m"
                  ><Icon name="calendar" :size="14" />
                  {{ new Date(c.deliveryAt).toLocaleString() }}</span
                >
                <span class="m"
                  ><Icon name="document" :size="14" /> {{ c.files.length }} files</span
                >
              </div>
            </div>
          </div>
          <div class="actions">
            <router-link class="btn" :to="`/unlock/${c.secretKey}`" title="Open">
              <Icon name="eye" :size="16" />
            </router-link>
            <button class="btn" @click="copyUnlock(c)" title="Copy unlock link">
              <Icon name="arrow-right" :size="16" />
            </button>
            <button class="btn" @click="downloadPdf(c)" title="Download PDF">
              <Icon name="download" :size="16" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  max-width: 1100px;
  margin: 1rem auto;
  padding: 0 1rem 1.2rem;
}

.dash-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: end;
  margin-bottom: 0.8rem;
}
@media (max-width: 720px) {
  .dash-head {
    grid-template-columns: 1fr;
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
.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  cursor: pointer;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--brand), #24d0b5);
  color: #08121f;
  transition:
    transform 0.06s ease-in,
    filter 0.2s ease;
}
.primary:active {
  transform: translateY(1px);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}
@media (max-width: 720px) {
  .stats {
    grid-template-columns: 1fr;
  }
}
.stat-card {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.6rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.8rem;
}
.stat-card .icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
}
.stat-card .icon.green {
  border-color: rgba(36, 208, 181, 0.35);
}
.value {
  font-size: 1.4rem;
  font-weight: 800;
}
.label {
  color: var(--text-2);
}

.list {
  margin-top: 1.2rem;
}
.caps-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}
.caps-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.6rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 0.7rem 0.9rem;
  transition:
    transform 0.12s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}
.caps-item:hover {
  transform: translateY(-1px);
  background: var(--surface-hover);
  border-color: rgba(255, 255, 255, 0.16);
}
.left {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem;
  align-items: center;
}
.badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
}
.badge.pub {
  border-color: rgba(36, 208, 181, 0.35);
}
.title {
  display: inline-block;
  margin-bottom: 0.15rem;
}
.meta {
  color: var(--text-2);
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}
.meta .m {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.actions {
  display: inline-flex;
  gap: 0.4rem;
}
.btn {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-1);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.06s ease-in;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.16);
}
.btn:active {
  transform: translateY(1px);
}

.skeleton-list {
  display: grid;
  gap: 8px;
}
.skeleton {
  height: 64px;
  border-radius: 12px;
  border: 1px solid var(--border);
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

.empty {
  display: grid;
  place-items: center;
  gap: 0.4rem;
  padding: 1rem;
  border: 1px dashed var(--border);
  border-radius: 12px;
  color: var(--text-2);
}
</style>
