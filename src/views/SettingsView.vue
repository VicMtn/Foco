<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useAutostart } from '../composables/useAutostart'

const SECS_PER_MINUTE = 60

const settings = useSettingsStore()
const autostart = useAutostart()

function minutesField(getSecs: () => number, setSecs: (s: number) => void, min: number) {
  return computed({
    get: () => Math.round(getSecs() / SECS_PER_MINUTE),
    set: (value: number) => setSecs(Math.max(min, value) * SECS_PER_MINUTE),
  })
}

const focusMinutes = minutesField(
  () => settings.focusSecs,
  (s) => (settings.focusSecs = s),
  1,
)
const shortBreakMinutes = minutesField(
  () => settings.shortBreakSecs,
  (s) => (settings.shortBreakSecs = s),
  1,
)
const longBreakMinutes = minutesField(
  () => settings.longBreakSecs,
  (s) => (settings.longBreakSecs = s),
  1,
)
</script>

<template>
  <section class="settings">
    <fieldset class="settings__group">
      <legend>Durations</legend>
      <label class="settings__row">
        <span>Focus</span>
        <input v-model.number="focusMinutes" type="number" min="1" max="180" />
        <span class="settings__unit">min</span>
      </label>
      <label class="settings__row">
        <span>Short break</span>
        <input v-model.number="shortBreakMinutes" type="number" min="1" max="60" />
        <span class="settings__unit">min</span>
      </label>
      <label class="settings__row">
        <span>Long break</span>
        <input v-model.number="longBreakMinutes" type="number" min="1" max="120" />
        <span class="settings__unit">min</span>
      </label>
      <label class="settings__row">
        <span>Cycles before long break</span>
        <input v-model.number="settings.cyclesBeforeLongBreak" type="number" min="1" max="12" />
      </label>
    </fieldset>

    <fieldset class="settings__group">
      <legend>Automation</legend>
      <label class="settings__row settings__row--toggle">
        <span>Automatic start focus</span>
        <input v-model="settings.autoStartFocus" type="checkbox" />
      </label>
      <label class="settings__row settings__row--toggle">
        <span>Automatic start break</span>
        <input v-model="settings.autoStartBreak" type="checkbox" />
      </label>
    </fieldset>

    <fieldset class="settings__group">
      <legend>Alerts</legend>
      <label class="settings__row settings__row--toggle">
        <span>Play sound</span>
        <input v-model="settings.soundEnabled" type="checkbox" />
      </label>
      <label class="settings__row settings__row--toggle">
        <span>System notification</span>
        <input v-model="settings.notificationsEnabled" type="checkbox" />
      </label>
    </fieldset>

    <fieldset class="settings__group">
      <legend>System</legend>
      <label class="settings__row settings__row--toggle">
        <span>Launch at login</span>
        <input v-model="autostart.enabled" type="checkbox" :disabled="!autostart.ready" />
      </label>
    </fieldset>

    <fieldset class="settings__group">
      <legend>Eye Care</legend>
      <label class="settings__row settings__row--toggle">
        <span>20-20-20 rule</span>
        <input v-model="settings.eyeCareEnabled" type="checkbox" />
      </label>
      <p class="settings__hint">
        Every 20 min of focus, look ~20ft (6m) away for 20s to rest your eyes.
      </p>
    </fieldset>
  </section>
</template>

<style scoped>
.settings {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1.75rem;
}

.settings__group {
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 10px;
  padding: 0.6rem 0.9rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.settings__group legend {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  opacity: 0.65;
  padding: 0 0.3rem;
}

.settings__row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.6rem;
  align-items: center;
  font-size: 0.85rem;
}

.settings__row--toggle {
  grid-template-columns: 1fr auto;
}

.settings__row input[type='number'] {
  width: 4.5rem;
  font: inherit;
  text-align: right;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: transparent;
  color: inherit;
}

.settings__row input[type='checkbox'] {
  accent-color: var(--accent);
  width: 1rem;
  height: 1rem;
}

.settings__unit {
  font-size: 0.75rem;
  opacity: 0.6;
}

.settings__hint {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  line-height: 1.35;
  opacity: 0.65;
}
</style>
