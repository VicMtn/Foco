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
  <section :class="['timer', `timer--${timer.currentKind}`]">
    <TimerRing :progress="timer.progress" :label="clock" :caption="phase" />
    <SessionControls
      :status="timer.status"
      @toggle="timer.toggle"
      @reset="timer.reset"
      @skip="timer.skip"
    />
  </section>
</template>

<style scoped>
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem 2rem;
}

.timer--focus {
  color: #d24d3a;
}

.timer--short_break {
  color: #2f9e6c;
}

.timer--long_break {
  color: #2f6ea5;
}
</style>
