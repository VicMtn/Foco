<script setup lang="ts">
import { computed, onMounted } from 'vue'
import StatsChart from '../components/StatsChart.vue'
import StreakBadge from '../components/StreakBadge.vue'
import { useStatsStore } from '../stores/stats'
import { dayLabel, lastNDays } from '../utils/days'
import { formatDuration } from '../utils/format'

const CHART_DAYS = 7

const stats = useStatsStore()

const points = computed(() => {
  const map = new Map(stats.perDay.map((d) => [d.day, d.secs]))
  return lastNDays(CHART_DAYS).map((day) => ({
    label: dayLabel(day),
    minutes: Math.round((map.get(day) ?? 0) / 60),
  }))
})

onMounted(() => {
  void stats.refresh()
})
</script>

<template>
  <section class="stats">
    <div class="stats__summary">
      <div class="stats__cell">
        <span class="stats__value">{{ formatDuration(stats.summary.todaySecs) }}</span>
        <span class="stats__label">Today</span>
      </div>
      <div class="stats__cell">
        <span class="stats__value">{{ formatDuration(stats.summary.weekSecs) }}</span>
        <span class="stats__label">7 days</span>
      </div>
      <div class="stats__cell">
        <span class="stats__value">{{ formatDuration(stats.summary.totalSecs) }}</span>
        <span class="stats__label">All time</span>
      </div>
    </div>

    <StatsChart :points="points" />

    <div class="stats__streak">
      <StreakBadge :days="stats.streak" />
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem 1.25rem 2rem;
}

.stats__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stats__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.6rem 0.4rem;
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 6%, transparent);
}

.stats__value {
  font-size: 1.1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.stats__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.65;
}

.stats__streak {
  display: flex;
  justify-content: center;
}
</style>
