import type { SessionKind } from '../types/timer'

export function formatClock(totalSecs: number): string {
  const safe = Math.max(0, Math.floor(totalSecs))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(totalSecs: number): string {
  const safe = Math.max(0, Math.floor(totalSecs))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function kindLabel(kind: SessionKind): string {
  switch (kind) {
    case 'focus':
      return 'Focus'
    case 'short_break':
      return 'Short break'
    case 'long_break':
      return 'Long break'
  }
}
