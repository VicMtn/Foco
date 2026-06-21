<script setup lang="ts">
import { computed } from 'vue'
import TimerRing from '../components/TimerRing.vue'
import SessionControls from '../components/SessionControls.vue'
import { useTimerStore } from '../stores/timer'
import { formatClock, kindLabel } from '../utils/format'

const timer = useTimerStore()

const clock = computed(() => formatClock(timer.remainingSecs))
const phase = computed(() => kindLabel(timer.currentKind))
</script>

<template>
  <section class="timer">
    <TimerRing :progress="timer.progress" :label="clock" :caption="phase" />
    <SessionControls
      :status="timer.status"
      @toggle="timer.toggle"
      @reset="timer.reset"
      @reset-all="timer.resetAll"
      @skip="timer.skip"
    />
  </section>
</template>

<style scoped>
.timer {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0 1rem;
  color: var(--accent);
}
</style>
