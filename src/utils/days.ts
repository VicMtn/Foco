const SHORT_WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

export function isoDay(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, n: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + n)
  return next
}

export function lastNDays(n: number, from: Date = new Date()): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(isoDay(addDays(from, -i)))
  }
  return days
}

export function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return SHORT_WEEKDAY.format(new Date(y, m - 1, d))
}
