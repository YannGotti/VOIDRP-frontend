import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { bootstrapAuth } from './stores/authStore'
import './styles.css'

;(async () => {
  await bootstrapAuth()
  createApp(App).use(router).mount('#app')
})().catch((error) => {
  console.error('Failed to bootstrap app:', error)
})