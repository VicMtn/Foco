<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface ChartPoint {
  label: string
  minutes: number
}

const props = defineProps<{
  points: ChartPoint[]
}>()

const data = computed<ChartData<'bar'>>(() => ({
  labels: props.points.map((p) => p.label),
  datasets: [
    {
      label: 'Focus (min)',
      data: props.points.map((p) => p.minutes),
      backgroundColor: '#ce8147',
      borderRadius: 6,
      maxBarThickness: 22,
    },
  ],
}))

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.parsed.y} min`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, font: { size: 10 } },
      grid: { color: 'rgba(127,127,127,0.15)' },
    },
  },
}
</script>

<template>
  <div class="chart">
    <Bar :data="data" :options="options" />
  </div>
</template>

<style scoped>
.chart {
  position: relative;
  height: 140px;
}
</style>
