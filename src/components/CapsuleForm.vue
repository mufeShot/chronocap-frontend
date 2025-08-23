<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { api } from '../services/api'
import type { CreateCapsuleInput, Capsule } from '../types'
import { useToasts } from '../composables/useToasts'
import ProgressBar from './ProgressBar.vue'

const { userEmail } = useAuth()
const { addToast } = useToasts()

const title = ref('')
const description = ref('')
const deliveryAt = ref<string>('')
const isPublic = ref<boolean>(false)
const files = ref<File[]>([])
const previews = ref<{ url: string; type: string; name: string }[]>([])
const isSubmitting = ref(false)
const progress = ref(0)

const MAX_FILES = 12
const MAX_SIZE_MB = 200 // per file
const ACCEPT = ['image/', 'video/']

const minDateStr = computed(() => {
  const d = new Date(Date.now() + 5 * 60 * 1000) // +5 min
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const h = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${y}-${m}-${day}T${h}:${min}`
})

function validateFiles(list: File[]) {
  const errs: string[] = []
  if (list.length + files.value.length > MAX_FILES) errs.push(`Max ${MAX_FILES} files.`)
  list.forEach((f) => {
    if (!ACCEPT.some((p) => f.type.startsWith(p))) errs.push(`Unsupported type: ${f.name}`)
    if (f.size > MAX_SIZE_MB * 1024 * 1024) errs.push(`Too large (${MAX_SIZE_MB}MB): ${f.name}`)
  })
  return errs
}

function addFiles(newFiles: File[]) {
  const errs = validateFiles(newFiles)
  if (errs.length) {
    addToast(errs[0], 'error', 4000)
    return
  }
  files.value = files.value.concat(newFiles)
  previews.value.push(
    ...newFiles.map((f) => ({ url: URL.createObjectURL(f), type: f.type, name: f.name })),
  )
}

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  addFiles(Array.from(input.files))
  input.value = ''
}

const dragOver = ref(false)
function onDrop(e: DragEvent) {
  dragOver.value = false
  const list = Array.from(e.dataTransfer?.files || [])
  if (list.length) addFiles(list)
}
function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}
function onDragLeave() {
  dragOver.value = false
}

function removeAt(idx: number) {
  const p = previews.value[idx]
  if (p) URL.revokeObjectURL(p.url)
  previews.value.splice(idx, 1)
  files.value.splice(idx, 1)
}

onBeforeUnmount(() => {
  previews.value.forEach((p) => URL.revokeObjectURL(p.url))
})

// PDF generation moved to parent (Dashboard) so user can choose when to download.

function resetForm() {
  title.value = ''
  description.value = ''
  deliveryAt.value = ''
  isPublic.value = false
  previews.value.forEach((p) => URL.revokeObjectURL(p.url))
  previews.value = []
  files.value = []
  progress.value = 0
}

const emit = defineEmits<{ (e: 'created', capsule: Capsule): void }>()

async function submitCapsule() {
  if (!userEmail.value) {
    addToast('Please login first.', 'error')
    return
  }
  if (!title.value.trim() || !deliveryAt.value) {
    addToast('Title and delivery date are required.', 'error')
    return
  }
  isSubmitting.value = true
  progress.value = 0
  try {
    const input: CreateCapsuleInput = {
      title: title.value.trim(),
      description: description.value.trim(),
      deliveryAt: new Date(deliveryAt.value).toISOString(),
      isPublic: isPublic.value,
      files: files.value,
    }
  const capsule = await api.createCapsule(input, {
      onProgress: (p: number) => {
        progress.value = p
      },
    })
  emit('created', capsule)
  addToast('Capsule created.', 'success')
    resetForm()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create capsule'
    addToast(msg, 'error', 5000)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="capsule-form" @submit.prevent="submitCapsule">
    <h2>Create a new time capsule</h2>

    <label>Title</label>
    <input v-model="title" type="text" required placeholder="My 2045 Capsule" />

    <label>Description</label>
    <textarea v-model="description" rows="3" placeholder="What memories are inside?"></textarea>

    <label>Deliver on</label>
    <input v-model="deliveryAt" :min="minDateStr" type="datetime-local" required />

    <label class="check">
      <input v-model="isPublic" type="checkbox" />
      Make this capsule public (show in the Public feed)
    </label>

    <label>Photos/Videos</label>
    <div
      class="dropzone"
      :class="{ over: dragOver }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <p><strong>Drag & drop</strong> files here, or</p>
      <input
        id="file-picker"
        type="file"
        accept="image/*,video/*"
        multiple
        @change="onFilesSelected"
        hidden
      />
      <label for="file-picker" class="browse">Browse</label>
    </div>

    <div v-if="previews.length" class="previews">
      <div v-for="(p, i) in previews" :key="p.url" class="preview">
        <button class="remove" type="button" @click="removeAt(i)" aria-label="Remove">×</button>
        <template v-if="p.type.startsWith('image/')">
          <img :src="p.url" :alt="p.name" />
        </template>
        <template v-else>
          <video :src="p.url" muted controls />
        </template>
        <div class="name">{{ p.name }}</div>
      </div>
    </div>

    <ProgressBar v-if="isSubmitting" :value="progress" label="Uploading" />

    <button class="submit" type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Creating...' : 'Create Capsule' }}
    </button>
  </form>
</template>

<style scoped>
.capsule-form {
  display: grid;
  gap: 0.6rem;
  background: #fff1;
  border: 1px solid #eee2;
  border-radius: 10px;
  padding: 1rem;
  max-width: 760px;
  margin: 1rem auto;
  color: var(--text-1);
}
.capsule-form h2 {
  margin-bottom: 0.5rem;
}
input[type='text'],
input[type='datetime-local'],
textarea {
  padding: 0.6rem;
  border: 1px solid #ddd3;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff1;
  color: var(--text-1);
}
.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.dropzone {
  display: grid;
  place-items: center;
  gap: 6px;
  padding: 18px;
  border: 2px dashed var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-2);
}
.dropzone.over {
  border-color: #24d0b5aa;
  background: rgba(36, 208, 181, 0.06);
}
.browse {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  background: #1abc9c;
  color: #08121f;
  cursor: pointer;
  font-weight: 800;
}
.previews {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.6rem;
}
.preview {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 6px;
}
.preview img,
.preview video {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  background: #000;
}
.remove {
  position: absolute;
  top: 6px;
  right: 6px;
  border: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
}
.name {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.submit {
  background: #1abc9c;
  color: #08121f;
  border: 0;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  justify-self: start;
}
</style>
