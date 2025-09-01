<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Sign In</h2>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
          />
        </div>
        
        <button type="submit" class="btn-primary full-width">
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

defineEmits<{
  close: []
}>()

const { signIn } = useAuth()

const email = ref('')
const password = ref('')

const handleSubmit = async () => {
  try {
    await signIn(email.value, password.value)
  } catch (error) {
    console.error('Sign in failed:', error)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-2);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  margin: 1rem;
  border: 1px solid var(--border);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-1);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-2);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-1);
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-1);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--brand);
}

.btn-primary {
  background: var(--brand);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: var(--brand-2);
}

.full-width {
  width: 100%;
}
</style>