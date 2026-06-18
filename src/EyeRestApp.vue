<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Eye, X } from 'lucide-vue-next'

const REST_SECS = 20

const state = ref<'ready' | 'counting'>('ready')
const remaining = ref(REST_SECS)
let intervalId: ReturnType<typeof setInterval> | null = null

function clearTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function startCountdown() {
  if (state.value === 'counting') return
  state.value = 'counting'
  remaining.value = REST_SECS
  intervalId = setInterval(() => {
    remaining.value = Math.max(0, remaining.value - 1)
    if (remaining.value === 0) {
      clearTimer()
      void getCurrentWindow().close()
    }
  }, 1000)
}

function dismiss() {
  clearTimer()
  void getCurrentWindow().close()
}

const label = computed(() =>
  state.value === 'ready' ? 'Look 20 feet away' : 'Looking away',
)

onUnmounted(clearTimer)
</script>

<template>
  <main class="rest">
    <div
      class="rest__bar"
      role="group"
      aria-label="Eye care reminder"
      data-tauri-drag-region
    >
      <span class="rest__icon" aria-hidden="true" data-tauri-drag-region>
        <Eye :size="16" :stroke-width="1.75" />
      </span>
      <span class="rest__label" data-tauri-drag-region>{{ label }}</span>
      <button
        v-if="state === 'ready'"
        class="rest__action"
        type="button"
        @click="startCountdown"
      >
        Start 20s
      </button>
      <span v-else class="rest__chip" aria-live="polite">{{ remaining }}s</span>
      <button
        class="rest__close"
        type="button"
        aria-label="Dismiss"
        @click="dismiss"
      >
        <X :size="14" :stroke-width="2.25" />
      </button>
    </div>
  </main>
</template>

<style>
:root {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui,
    sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  --accent: #ce8147;
}

html,
body,
#app {
  margin: 0;
  height: 100vh;
  background: transparent;
  overflow: hidden;
}
</style>

<style scoped>
.rest {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
}

.rest__bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  height: 48px;
  padding: 0 6px 0 14px;
  border-radius: 999px;
  background: rgba(28, 28, 30, 0.78);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.36),
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 -1px 0 rgba(0, 0, 0, 0.2) inset;
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.84rem;
  font-weight: 500;
  letter-spacing: 0.005em;
}

@media (prefers-color-scheme: light) {
  .rest__bar {
    background: rgba(246, 246, 248, 0.78);
    color: rgba(0, 0, 0, 0.9);
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow:
      0 14px 36px rgba(0, 0, 0, 0.18),
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 -1px 0 rgba(0, 0, 0, 0.04) inset;
  }
}

.rest__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  opacity: 0.7;
  flex-shrink: 0;
}

.rest__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rest__action,
.rest__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 92px;
  padding: 0 0.95rem;
  border-radius: 999px;
  font: inherit;
  font-weight: 500;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0;
}

.rest__action {
  border: none;
  cursor: pointer;
  background: var(--accent);
  color: #1d1d1d;
  transition: filter 0.12s ease, transform 0.12s ease;
}

.rest__action:hover {
  filter: brightness(1.06);
}

.rest__action:active {
  transform: scale(0.97);
  filter: brightness(0.95);
}

.rest__chip {
  background: color-mix(in srgb, var(--accent) 24%, transparent);
  color: color-mix(in srgb, var(--accent) 92%, white);
}

.rest__close {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.6;
  transition: background 0.12s ease, opacity 0.12s ease;
  flex-shrink: 0;
}

.rest__close:hover {
  background: color-mix(in srgb, currentColor 14%, transparent);
  opacity: 1;
}

.rest__close:active {
  background: color-mix(in srgb, currentColor 20%, transparent);
}
</style>
