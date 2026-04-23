import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { bootstrapAuth, installAuthApiHooks } from './stores/authStore'
import './styles.css'
import './styles.toast-nations.css'

;(async () => {
  installAuthApiHooks()
  await bootstrapAuth()
  createApp(App).use(router).mount('#app')
})().catch((error) => {
  console.error('Failed to bootstrap app:', error)
})
