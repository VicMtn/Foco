import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useSettingsStore } from './stores/settings'

const app = createApp(App)
app.use(createPinia())

useSettingsStore()
  .load()
  .catch((err) => console.error('Failed to load settings', err))
  .finally(() => app.mount('#app'))
