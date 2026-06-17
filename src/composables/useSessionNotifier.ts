import { watch } from 'vue'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import { useSettingsStore } from '../stores/settings'
import { useTimerStore } from '../stores/timer'
import type { ConcludedSession } from '../types/timer'
import { playCompletionChime } from '../utils/sound'

export function useSessionNotifier() {
  const timer = useTimerStore()
  const settings = useSettingsStore()

  watch(
    () => timer.lastConcluded,
    (session) => {
      if (!session || !session.completed) return
      if (settings.soundEnabled) safelyChime()
      if (settings.notificationsEnabled) void notify(session)
    },
  )
}

function safelyChime() {
  try {
    playCompletionChime()
  } catch (err) {
    console.warn('Audio chime failed', err)
  }
}

async function notify(session: ConcludedSession) {
  try {
    const granted = (await isPermissionGranted()) || (await requestPermission()) === 'granted'
    if (!granted) return
    sendNotification(buildPayload(session))
  } catch (err) {
    console.warn('Notification failed', err)
  }
}

function buildPayload(session: ConcludedSession): { title: string; body: string } {
  switch (session.kind) {
    case 'focus':
      return { title: 'Focus done', body: 'Time to take a break.' }
    case 'short_break':
      return { title: 'Short break done', body: 'Back to focus when you are ready.' }
    case 'long_break':
      return { title: 'Long break done', body: 'Fresh start — back to focus.' }
  }
}
