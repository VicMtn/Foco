export type SessionKind = 'focus' | 'short_break' | 'long_break'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface ConcludedSession {
  kind: SessionKind
  plannedSecs: number
  actualSecs: number
  startedAt: string
  endedAt: string
  completed: boolean
}
