import { setActivePinia, createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTimerStore } from './timer'
import { useSettingsStore } from './settings'

let timer: ReturnType<typeof useTimerStore>
let settings: ReturnType<typeof useSettingsStore>

// Start the current phase and fast-forward exactly its duration so it
// completes naturally through the tick loop.
function runToCompletion() {
  const secs = timer.remainingSecs
  timer.start()
  vi.advanceTimersByTime(secs * 1000)
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 5, 15, 9, 0, 0))
  settings = useSettingsStore()
  timer = useTimerStore()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('timer store', () => {
  it('starts on an idle focus phase at full duration', () => {
    expect(timer.status).toBe('idle')
    expect(timer.currentKind).toBe('focus')
    expect(timer.remainingSecs).toBe(25 * 60)
    expect(timer.progress).toBe(0)
  })

  it('counts down while running', () => {
    timer.start()
    expect(timer.status).toBe('running')
    vi.advanceTimersByTime(10_000)
    expect(timer.remainingSecs).toBe(25 * 60 - 10)
  })

  it('pauses and preserves the elapsed time', () => {
    timer.start()
    vi.advanceTimersByTime(10_000)
    timer.pause()
    expect(timer.status).toBe('paused')
    expect(timer.remainingSecs).toBe(25 * 60 - 10)
  })

  it('toggles between running and paused', () => {
    timer.toggle()
    expect(timer.status).toBe('running')
    timer.toggle()
    expect(timer.status).toBe('paused')
  })

  it('marks focus finished and banks the cycle on natural completion', () => {
    runToCompletion()
    expect(timer.status).toBe('finished')
    expect(timer.remainingSecs).toBe(0)
    expect(timer.completedFocusInCycle).toBe(1)
    expect(timer.lastConcluded?.kind).toBe('focus')
    expect(timer.lastConcluded?.completed).toBe(true)
    expect(timer.lastConcluded?.actualSecs).toBe(25 * 60)
  })

  it('records an incomplete session when skipping a running focus', () => {
    timer.start()
    vi.advanceTimersByTime(10_000)
    timer.skip()
    expect(timer.lastConcluded?.kind).toBe('focus')
    expect(timer.lastConcluded?.completed).toBe(false)
    expect(timer.lastConcluded?.actualSecs).toBe(10)
    expect(timer.currentKind).toBe('short_break')
  })

  it('auto-starts the break when autoStartBreak is enabled', () => {
    settings.autoStartBreak = true
    runToCompletion()
    expect(timer.currentKind).toBe('short_break')
    expect(timer.status).toBe('running')
  })

  it('schedules a long break after the configured number of focus cycles', () => {
    settings.cyclesBeforeLongBreak = 2

    runToCompletion() // focus #1
    timer.skip() // -> short break
    expect(timer.currentKind).toBe('short_break')
    runToCompletion() // finish the break
    timer.skip() // -> focus again
    expect(timer.currentKind).toBe('focus')

    runToCompletion() // focus #2
    timer.skip() // -> long break now due
    expect(timer.currentKind).toBe('long_break')
  })

  it('reset returns the current phase to full duration and idle', () => {
    timer.start()
    vi.advanceTimersByTime(30_000)
    timer.reset()
    expect(timer.status).toBe('idle')
    expect(timer.remainingSecs).toBe(25 * 60)
    expect(timer.currentKind).toBe('focus')
  })

  it('resetAll clears the cycle counter and returns to focus', () => {
    settings.cyclesBeforeLongBreak = 2
    runToCompletion()
    timer.skip()
    expect(timer.completedFocusInCycle).toBe(1)

    timer.resetAll()
    expect(timer.currentKind).toBe('focus')
    expect(timer.completedFocusInCycle).toBe(0)
    expect(timer.status).toBe('idle')
  })
})
