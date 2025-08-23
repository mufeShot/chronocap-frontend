import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
// Explicit index import to avoid directory resolution issues in some CI builds (Netlify)
import router from './router/index'
import { useAuth } from './composables/useAuth'

const app = createApp(App)
app.use(router)

const { initAuth } = useAuth()
initAuth()

app.mount('#app')
