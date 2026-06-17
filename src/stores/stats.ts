import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { computeStreak } from '../utils/streak'

const HISTORY_DAYS = 30
const SUMMARY_CMD = 'get_stats_summary'
const PER_DAY_CMD = 'get_focus_per_day'

export interface StatsSummary {
  todaySecs: number
  weekSecs: number
  totalSecs: number
}

export interface DailyFocus {
  day: string
  secs: number
}

export const useStatsStore = defineStore('stats', () => {
  const summary = ref<StatsSummary>({ todaySecs: 0, weekSecs: 0, totalSecs: 0 })
  const perDay = ref<DailyFocus[]>([])
  const loading = ref(false)

  const streak = computed(() =>
    computeStreak(perDay.value.filter((d) => d.secs > 0).map((d) => d.day)),
  )

  async function refresh() {
    loading.value = true
    try {
      const [nextSummary, nextPerDay] = await Promise.all([
        invoke<StatsSummary>(SUMMARY_CMD),
        invoke<DailyFocus[]>(PER_DAY_CMD, { days: HISTORY_DAYS }),
      ])
      summary.value = nextSummary
      perDay.value = nextPerDay
    } finally {
      loading.value = false
    }
  }

  return { summary, perDay, streak, loading, refresh }
})
