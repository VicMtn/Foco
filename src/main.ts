import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { getCurrentWindow } from '@tauri-apps/api/window'
import App from './App.vue'
import EyeRestApp from './EyeRestApp.vue'
import { useSettingsStore } from './stores/settings'

const label = getCurrentWindow().label

if (label === 'eye-rest') {
  createApp(EyeRestApp).mount('#app')
} else {
  const app = createApp(App)
  app.use(createPinia())

  useSettingsStore()
    .load()
    .catch((err) => console.error('Failed to load settings', err))
    .finally(() => app.mount('#app'))
}
