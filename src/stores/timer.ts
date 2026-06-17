import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { SessionKind, TimerStatus } from '../types/timer'
import { useSettingsStore } from './settings'

const TICK_MS = 250

export const useTimerStore = defineStore('timer', () => {
  const settings = useSettingsStore()

  const status = ref<TimerStatus>('idle')
  const currentKind = ref<SessionKind>('focus')
  const completedFocusInCycle = ref(0)
  const remainingSecs = ref(settings.durationFor('focus'))

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

  function tick() {
    if (endsAt === null) return
    const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    remainingSecs.value = left
    if (left === 0) {
      stopTicking()
      completedFocusInCycle.value += currentKind.value === 'focus' ? 1 : 0
      status.value = 'finished'
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
    if (status.value === 'finished') {
      advance()
    }
    if (remainingSecs.value <= 0) {
      remainingSecs.value = totalSecs.value
    }
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
    status.value === 'running' ? pause() : start()
  }

  function reset() {
    stopTicking()
    remainingSecs.value = totalSecs.value
    status.value = 'idle'
  }

  function advance() {
    stopTicking()
    if (currentKind.value === 'long_break') {
      completedFocusInCycle.value = 0
    }
    loadKind(nextKind())
  }

  function skip() {
    advance()
  }

  return {
    status,
    currentKind,
    remainingSecs,
    completedFocusInCycle,
    totalSecs,
    progress,
    start,
    pause,
    toggle,
    reset,
    skip,
  }
})
