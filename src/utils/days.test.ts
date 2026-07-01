import { describe, expect, it } from 'vitest'
import { addDays, isoDay, lastNDays } from './days'

describe('isoDay', () => {
  it('formats local dates as zero-padded YYYY-MM-DD', () => {
    expect(isoDay(new Date(2026, 0, 3))).toBe('2026-01-03')
    expect(isoDay(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('addDays', () => {
  it('moves forward and backward across month boundaries', () => {
    expect(isoDay(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01')
    expect(isoDay(addDays(new Date(2026, 2, 1), -1))).toBe('2026-02-28')
  })

  it('does not mutate the input date', () => {
    const src = new Date(2026, 5, 15)
    addDays(src, 5)
    expect(isoDay(src)).toBe('2026-06-15')
  })
})

describe('lastNDays', () => {
  it('returns n ascending days ending at the reference day', () => {
    expect(lastNDays(3, new Date(2026, 5, 15))).toEqual(['2026-06-13', '2026-06-14', '2026-06-15'])
  })
})
