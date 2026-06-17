import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SessionKind } from '../types/timer'

const MINUTE = 60

export const useSettingsStore = defineStore('settings', () => {
  const focusSecs = ref(25 * MINUTE)
  const shortBreakSecs = ref(5 * MINUTE)
  const longBreakSecs = ref(15 * MINUTE)
  const cyclesBeforeLongBreak = ref(4)

  function durationFor(kind: SessionKind): number {
    switch (kind) {
      case 'focus':
        return focusSecs.value
      case 'short_break':
        return shortBreakSecs.value
      case 'long_break':
        return longBreakSecs.value
    }
  }

  return {
    focusSecs,
    shortBreakSecs,
    longBreakSecs,
    cyclesBeforeLongBreak,
    durationFor,
  }
})
