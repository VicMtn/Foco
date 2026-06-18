import { defineStore } from 'pinia'
import { ref, watch, type Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { SessionKind } from '../types/timer'

const MINUTE = 60

const DEFAULTS = {
  focusSecs: 25 * MINUTE,
  shortBreakSecs: 5 * MINUTE,
  longBreakSecs: 15 * MINUTE,
  cyclesBeforeLongBreak: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  autoStartFocus: false,
  autoStartBreak: false,
}

export const useSettingsStore = defineStore('settings', () => {
  const focusSecs = ref(DEFAULTS.focusSecs)
  const shortBreakSecs = ref(DEFAULTS.shortBreakSecs)
  const longBreakSecs = ref(DEFAULTS.longBreakSecs)
  const cyclesBeforeLongBreak = ref(DEFAULTS.cyclesBeforeLongBreak)
  const soundEnabled = ref(DEFAULTS.soundEnabled)
  const notificationsEnabled = ref(DEFAULTS.notificationsEnabled)
  const autoStartFocus = ref(DEFAULTS.autoStartFocus)
  const autoStartBreak = ref(DEFAULTS.autoStartBreak)
  const ready = ref(false)

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

  async function load() {
    const stored = await invoke<Record<string, string>>('get_settings')
    focusSecs.value = readInt(stored, 'focusSecs', DEFAULTS.focusSecs)
    shortBreakSecs.value = readInt(stored, 'shortBreakSecs', DEFAULTS.shortBreakSecs)
    longBreakSecs.value = readInt(stored, 'longBreakSecs', DEFAULTS.longBreakSecs)
    cyclesBeforeLongBreak.value = readInt(stored, 'cyclesBeforeLongBreak', DEFAULTS.cyclesBeforeLongBreak)
    soundEnabled.value = readBool(stored, 'soundEnabled', DEFAULTS.soundEnabled)
    notificationsEnabled.value = readBool(stored, 'notificationsEnabled', DEFAULTS.notificationsEnabled)
    autoStartFocus.value = readBool(stored, 'autoStartFocus', DEFAULTS.autoStartFocus)
    autoStartBreak.value = readBool(stored, 'autoStartBreak', DEFAULTS.autoStartBreak)
    ready.value = true
  }

  watchPersistableNumber('focusSecs', focusSecs, ready)
  watchPersistableNumber('shortBreakSecs', shortBreakSecs, ready)
  watchPersistableNumber('longBreakSecs', longBreakSecs, ready)
  watchPersistableNumber('cyclesBeforeLongBreak', cyclesBeforeLongBreak, ready)
  watchPersistableBool('soundEnabled', soundEnabled, ready)
  watchPersistableBool('notificationsEnabled', notificationsEnabled, ready)
  watchPersistableBool('autoStartFocus', autoStartFocus, ready)
  watchPersistableBool('autoStartBreak', autoStartBreak, ready)

  return {
    focusSecs,
    shortBreakSecs,
    longBreakSecs,
    cyclesBeforeLongBreak,
    soundEnabled,
    notificationsEnabled,
    autoStartFocus,
    autoStartBreak,
    ready,
    durationFor,
    load,
  }
})

function watchPersistableNumber(key: string, value: Ref<number>, ready: Ref<boolean>) {
  watch(value, (v) => {
    if (!ready.value) return
    void persist(key, String(v))
  })
}

function watchPersistableBool(key: string, value: Ref<boolean>, ready: Ref<boolean>) {
  watch(value, (v) => {
    if (!ready.value) return
    void persist(key, v ? 'true' : 'false')
  })
}

async function persist(key: string, value: string) {
  try {
    await invoke('set_setting', { key, value })
  } catch (err) {
    console.error(`Failed to persist setting ${key}`, err)
  }
}

function readInt(stored: Record<string, string>, key: string, fallback: number): number {
  const raw = stored[key]
  if (raw === undefined) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : fallback
}

function readBool(stored: Record<string, string>, key: string, fallback: boolean): boolean {
  const raw = stored[key]
  if (raw === undefined) return fallback
  return raw === 'true'
}
