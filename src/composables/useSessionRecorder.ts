import { watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useStatsStore } from '../stores/stats'
import { useTimerStore } from '../stores/timer'
import type { ConcludedSession } from '../types/timer'

const RECORD_SESSION_CMD = 'record_session'

export function useSessionRecorder() {
  const timer = useTimerStore()
  const stats = useStatsStore()

  watch(
    () => timer.lastConcluded,
    async (session) => {
      if (!session) return
      await persist(session)
      await stats.refresh()
    },
  )
}

async function persist(session: ConcludedSession) {
  try {
    await invoke(RECORD_SESSION_CMD, { session })
  } catch (err) {
    console.error('Failed to record session', err)
  }
}
