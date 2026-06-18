<script setup lang="ts">
import { computed } from 'vue'
import { RotateCcw, ChevronsRight } from 'lucide-vue-next'
import type { TimerStatus } from '../types/timer'

const props = defineProps<{
  status: TimerStatus
}>()

const emit = defineEmits<{
  toggle: []
  reset: []
  skip: []
}>()

const primaryLabel = computed(() => {
  switch (props.status) {
    case 'running':
      return 'Pause'
    case 'paused':
      return 'Resume'
    case 'finished':
      return 'Start next'
    case 'idle':
    default:
      return 'Start'
  }
})
</script>

<template>
  <div class="controls">
    <button
      class="controls__btn controls__btn--secondary controls__btn--icon"
      type="button"
      aria-label="Reset"
      @click="emit('reset')"
    >
      <RotateCcw :size="18" :stroke-width="2" aria-hidden="true" />
    </button>
    <button
      class="controls__btn controls__btn--primary"
      type="button"
      @click="emit('toggle')"
    >
      {{ primaryLabel }}
    </button>
    <button
      class="controls__btn controls__btn--secondary controls__btn--icon"
      type="button"
      aria-label="Skip"
      @click="emit('skip')"
    >
      <ChevronsRight :size="20" :stroke-width="2" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.controls {
  align-self: stretch;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}

.controls__btn:nth-child(1) {
  justify-self: start;
}

.controls__btn:nth-child(2) {
  justify-self: center;
}

.controls__btn:nth-child(3) {
  justify-self: end;
}

.controls__btn {
  font: inherit;
  font-weight: 500;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  padding: 0.5rem 1.1rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, filter 0.15s ease;
}

.controls__btn--secondary:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.controls__btn--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
}

.controls__btn--primary {
  color: var(--btn-fg);
  background: var(--btn-bg);
  border-color: var(--btn-bg);
}

.controls__btn--primary:hover {
  background: color-mix(in srgb, var(--btn-bg) 88%, var(--btn-fg));
  border-color: color-mix(in srgb, var(--btn-bg) 88%, var(--btn-fg));
}
</style>
