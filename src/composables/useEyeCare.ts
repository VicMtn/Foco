import { onScopeDispose, ref, watch } from 'vue'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { primaryMonitor } from '@tauri-apps/api/window'
import { useSettingsStore } from '../stores/settings'
import { useTimerStore } from '../stores/timer'

const FOCUS_INTERVAL_SECS = 20 * 60
const REST_WINDOW_LABEL = 'eye-rest'
const REST_WIN_W = 460
const REST_WIN_H = 64

export function useEyeCare() {
  const settings = useSettingsStore()
  const timer = useTimerStore()

  const elapsedFocusSecs = ref(0)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function tick() {
    if (!settings.developerMode) return
    if (timer.status !== 'running' || timer.currentKind !== 'focus') return

    elapsedFocusSecs.value += 1
    if (elapsedFocusSecs.value >= FOCUS_INTERVAL_SECS) {
      elapsedFocusSecs.value = 0
      void notify('Time to rest your eyes', 'Look ~20 ft (6 m) away for 20 seconds.')
      void openRestWindow()
    }
  }

  function ensureInterval() {
    if (intervalId !== null) return
    intervalId = setInterval(tick, 1000)
  }

  function stopInterval() {
    if (intervalId === null) return
    clearInterval(intervalId)
    intervalId = null
  }

  watch(
    () => settings.developerMode,
    (enabled) => {
      if (enabled) {
        ensureInterval()
      } else {
        elapsedFocusSecs.value = 0
        stopInterval()
        void closeRestWindow()
      }
    },
    { immediate: true },
  )

  watch(
    () => timer.currentKind,
    (kind) => {
      if (kind !== 'focus') elapsedFocusSecs.value = 0
    },
  )

  onScopeDispose(stopInterval)
}

async function notify(title: string, body: string) {
  try {
    const granted = (await isPermissionGranted()) || (await requestPermission()) === 'granted'
    if (!granted) return
    sendNotification({ title, body })
  } catch (err) {
    console.warn('Eye-care notification failed', err)
  }
}

async function openRestWindow() {
  try {
    const existing = await WebviewWindow.getByLabel(REST_WINDOW_LABEL)
    if (existing) {
      await existing.show()
      await existing.setFocus()
      return
    }
    const position = await computeRestWindowPosition()
    const win = new WebviewWindow(REST_WINDOW_LABEL, {
      url: 'index.html',
      title: 'Eye care',
      width: REST_WIN_W,
      height: REST_WIN_H,
      decorations: false,
      transparent: true,
      shadow: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      focus: true,
      acceptFirstMouse: true,
      visibleOnAllWorkspaces: true,
      ...(position ?? { center: true }),
    })
    win.once('tauri://error', (err) => {
      console.warn('Failed to create eye-rest window', err)
    })
  } catch (err) {
    console.warn('Failed to open eye-rest window', err)
  }
}

async function computeRestWindowPosition(): Promise<{ x: number; y: number } | null> {
  try {
    const monitor = await primaryMonitor()
    if (!monitor) return null
    const scale = monitor.scaleFactor || 1
    const waX = monitor.workArea.position.x / scale
    const waY = monitor.workArea.position.y / scale
    const waW = monitor.workArea.size.width / scale
    const waH = monitor.workArea.size.height / scale
    const x = Math.round(waX + (waW - REST_WIN_W) / 2)
    const y = Math.round(waY + waH * 0.2 - REST_WIN_H / 2)
    return { x, y }
  } catch {
    return null
  }
}

async function closeRestWindow() {
  try {
    const existing = await WebviewWindow.getByLabel(REST_WINDOW_LABEL)
    if (existing) await existing.close()
  } catch (err) {
    console.warn('Failed to close eye-rest window', err)
  }
}
