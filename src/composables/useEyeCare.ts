import { computed, onScopeDispose, watch } from 'vue'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { primaryMonitor } from '@tauri-apps/api/window'
import { useSettingsStore } from '../stores/settings'
import { useTimerStore } from '../stores/timer'
import { notify } from '../utils/notify'

const FOCUS_INTERVAL_MS = 20 * 60 * 1000
const POLL_MS = 1000
const REST_WINDOW_LABEL = 'eye-rest'
const REST_WIN_W = 460
const REST_WIN_H = 64

export function useEyeCare() {
  const settings = useSettingsStore()
  const timer = useTimerStore()

  // Accrued focus time is measured from wall-clock samples (Date.now) rather
  // than by counting interval ticks. The popover webview is hidden most of the
  // time and its timers get throttled, so a tick counter would badly
  // under-count; sampling the clock stays accurate even when polls fire late.
  let bankedMs = 0
  let runSince: number | null = null
  let intervalId: ReturnType<typeof setInterval> | null = null

  const active = computed(
    () =>
      settings.eyeCareEnabled &&
      timer.status === 'running' &&
      timer.currentKind === 'focus',
  )

  function elapsedFocusMs(): number {
    return bankedMs + (runSince !== null ? Date.now() - runSince : 0)
  }

  function resetElapsed() {
    bankedMs = 0
    runSince = active.value ? Date.now() : null
  }

  function poll() {
    if (!active.value) return
    if (elapsedFocusMs() >= FOCUS_INTERVAL_MS) {
      resetElapsed()
      void notify('Time to rest your eyes', 'Look ~20 ft (6 m) away for 20 seconds.')
      void openRestWindow()
    }
  }

  function ensureInterval() {
    if (intervalId === null) intervalId = setInterval(poll, POLL_MS)
  }

  function stopInterval() {
    if (intervalId === null) return
    clearInterval(intervalId)
    intervalId = null
  }

  // Open/close the current focus segment as the timer runs, pauses or switches
  // phase, banking the elapsed wall-clock time of each running segment.
  watch(
    active,
    (isActive) => {
      if (isActive) {
        runSince = Date.now()
        ensureInterval()
      } else {
        if (runSince !== null) {
          bankedMs += Date.now() - runSince
          runSince = null
        }
        stopInterval()
      }
    },
    { immediate: true },
  )

  // Leaving focus (break, skip, reset) clears the accrued eye-strain time.
  watch(
    () => timer.currentKind,
    (kind) => {
      if (kind !== 'focus') {
        bankedMs = 0
        runSince = null
      }
    },
  )

  // Turning the feature off resets progress and dismisses any open widget.
  watch(
    () => settings.eyeCareEnabled,
    (enabled) => {
      if (!enabled) {
        resetElapsed()
        void closeRestWindow()
      }
    },
  )

  onScopeDispose(stopInterval)
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
