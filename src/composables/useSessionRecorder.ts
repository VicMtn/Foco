import { watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { useTimerStore } from '../stores/timer'
import type { ConcludedSession } from '../types/timer'

const RECORD_SESSION_CMD = 'record_session'

export function useSessionRecorder() {
  const timer = useTimerStore()

  watch(
    () => timer.lastConcluded,
    (session) => {
      if (session) persist(session)
    },
  )
}

function persist(session: ConcludedSession) {
  void invoke(RECORD_SESSION_CMD, { session }).catch((err) => {
    console.error('Failed to record session', err)
  })
}
