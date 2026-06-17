import { addDays, isoDay } from './days'

export function computeStreak(daysWithFocus: Iterable<string>, today: Date = new Date()): number {
  const set = new Set(daysWithFocus)
  if (set.size === 0) return 0

  const todayIso = isoDay(today)
  const yesterdayIso = isoDay(addDays(today, -1))

  let cursor: Date
  if (set.has(todayIso)) cursor = today
  else if (set.has(yesterdayIso)) cursor = addDays(today, -1)
  else return 0

  let count = 0
  while (set.has(isoDay(cursor))) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}
