import { describe, expect, it } from 'vitest'
import { formatClock, formatDuration, kindLabel } from './format'

describe('formatClock', () => {
  it('pads minutes and seconds to two digits', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(5)).toBe('00:05')
    expect(formatClock(65)).toBe('01:05')
    expect(formatClock(25 * 60)).toBe('25:00')
  })

  it('clamps negatives to zero and floors fractions', () => {
    expect(formatClock(-10)).toBe('00:00')
    expect(formatClock(59.9)).toBe('00:59')
  })

  it('keeps minutes above 99 without truncating', () => {
    expect(formatClock(100 * 60)).toBe('100:00')
  })
})

describe('formatDuration', () => {
  it('renders minutes-only under an hour', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(59)).toBe('0m')
    expect(formatDuration(90)).toBe('1m')
    expect(formatDuration(45 * 60)).toBe('45m')
  })

  it('renders hours and minutes past an hour', () => {
    expect(formatDuration(60 * 60)).toBe('1h 0m')
    expect(formatDuration(90 * 60)).toBe('1h 30m')
    expect(formatDuration(3 * 3600 + 5 * 60)).toBe('3h 5m')
  })
})

describe('kindLabel', () => {
  it('maps each session kind to a human label', () => {
    expect(kindLabel('focus')).toBe('Focus')
    expect(kindLabel('short_break')).toBe('Short break')
    expect(kindLabel('long_break')).toBe('Long break')
  })
})
