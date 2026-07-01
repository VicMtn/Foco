import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { ConcludedSession, SessionKind, TimerStatus } from '../types/timer'
import { useSettingsStore } from './settings'

const TICK_MS = 250

export const useTimerStore = defineStore('timer', () => {
  const settings = useSettingsStore()

  const status = ref<TimerStatus>('idle')
  const currentKind = ref<SessionKind>('focus')
  const completedFocusInCycle = ref(0)
  const remainingSecs = ref(settings.durationFor('focus'))
  const startedAt = ref<string | null>(null)
  const lastConcluded = ref<ConcludedSession | null>(null)

  let endsAt: number | null = null
  let intervalId: ReturnType<typeof setInterval> | null = null

  const totalSecs = computed(() => settings.durationFor(currentKind.value))
  const progress = computed(() => {
    const total = totalSecs.value
    return total <= 0 ? 0 : 1 - remainingSecs.value / total
  })

  function stopTicking() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
    endsAt = null
  }

  function recordConclusion(completed: boolean) {
    if (startedAt.value === null) return
    const actualSecs = totalSecs.value - remainingSecs.value
    if (actualSecs <= 0) {
      startedAt.value = null
      return
    }
    lastConcluded.value = {
      kind: currentKind.value,
      plannedSecs: totalSecs.value,
      actualSecs,
      startedAt: startedAt.value,
      endedAt: new Date().toISOString(),
      completed,
    }
    startedAt.value = null
  }

  function tick() {
    if (endsAt === null) return
    const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    remainingSecs.value = left
    if (left === 0) {
      stopTicking()
      const justFinishedFocus = currentKind.value === 'focus'
      if (justFinishedFocus) completedFocusInCycle.value += 1
      recordConclusion(true)
      status.value = 'finished'
      const shouldAutoStart = justFinishedFocus ? settings.autoStartBreak : settings.autoStartFocus
      if (shouldAutoStart) start()
    }
  }

  function nextKind(): SessionKind {
    if (currentKind.value !== 'focus') return 'focus'
    return completedFocusInCycle.value >= settings.cyclesBeforeLongBreak
      ? 'long_break'
      : 'short_break'
  }

  function loadKind(kind: SessionKind) {
    currentKind.value = kind
    remainingSecs.value = settings.durationFor(kind)
    status.value = 'idle'
  }

  function start() {
    if (status.value === 'running') return
    if (status.value === 'finished') advance()
    if (remainingSecs.value <= 0) remainingSecs.value = totalSecs.value
    if (startedAt.value === null) startedAt.value = new Date().toISOString()
    endsAt = Date.now() + remainingSecs.value * 1000
    status.value = 'running'
    intervalId = setInterval(tick, TICK_MS)
  }

  function pause() {
    if (status.value !== 'running') return
    tick()
    stopTicking()
    status.value = 'paused'
  }

  function toggle() {
    if (status.value === 'running') pause()
    else start()
  }

  function reset() {
    stopTicking()
    startedAt.value = null
    remainingSecs.value = totalSecs.value
    status.value = 'idle'
  }

  function resetAll() {
    stopTicking()
    startedAt.value = null
    completedFocusInCycle.value = 0
    loadKind('focus')
  }

  function advance() {
    stopTicking()
    startedAt.value = null
    if (currentKind.value === 'long_break') completedFocusInCycle.value = 0
    loadKind(nextKind())
  }

  function skip() {
    if (status.value === 'running' || status.value === 'paused') {
      recordConclusion(false)
    }
    advance()
  }

  watch(totalSecs, (next) => {
    if (status.value === 'idle' || status.value === 'finished') {
      remainingSecs.value = next
    }
  })

  return {
    status,
    currentKind,
    remainingSecs,
    completedFocusInCycle,
    lastConcluded,
    totalSecs,
    progress,
    start,
    pause,
    toggle,
    reset,
    resetAll,
    skip,
  }
})
