import { watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useTimerStore } from '../stores/timer'
import type { ConcludedSession } from '../types/timer'
import { notify } from '../utils/notify'
import { playCompletionChime } from '../utils/sound'

export function useSessionNotifier() {
  const timer = useTimerStore()
  const settings = useSettingsStore()

  watch(
    () => timer.lastConcluded,
    (session) => {
      if (!session || !session.completed) return
      if (settings.soundEnabled) safelyChime()
      if (settings.notificationsEnabled) {
        const { title, body } = buildPayload(session)
        void notify(title, body)
      }
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
