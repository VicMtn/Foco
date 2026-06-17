import { onMounted, ref, watch } from 'vue'
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'

export function useAutostart() {
  const enabled = ref(false)
  const ready = ref(false)

  onMounted(async () => {
    try {
      enabled.value = await isEnabled()
    } catch (err) {
      console.warn('Autostart probe failed', err)
    }
    ready.value = true
  })

  watch(enabled, async (next) => {
    if (!ready.value) return
    try {
      if (next) await enable()
      else await disable()
    } catch (err) {
      console.error('Autostart toggle failed', err)
    }
  })

  return { enabled, ready }
}
