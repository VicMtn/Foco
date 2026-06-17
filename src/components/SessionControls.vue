<script setup lang="ts">
import { computed } from 'vue'
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
      class="controls__btn controls__btn--secondary"
      type="button"
      @click="emit('reset')"
    >
      Reset
    </button>
    <button
      class="controls__btn controls__btn--primary"
      type="button"
      @click="emit('toggle')"
    >
      {{ primaryLabel }}
    </button>
    <button
      class="controls__btn controls__btn--secondary"
      type="button"
      @click="emit('skip')"
    >
      Skip
    </button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.controls__btn {
  font: inherit;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  padding: 0.6rem 1.4rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.controls__btn:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.controls__btn--primary {
  padding: 0.7rem 2rem;
  font-weight: 600;
  color: var(--btn-fg);
  background: var(--btn-bg);
  border-color: var(--btn-bg);
}

.controls__btn--primary:hover {
  filter: brightness(1.1);
}
</style>
