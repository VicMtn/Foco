import { describe, expect, it } from 'vitest'
import { computeStreak } from './streak'
import { isoDay, addDays } from './days'

const TODAY = new Date(2026, 5, 15) // 2026-06-15, local
const day = (offset: number) => isoDay(addDays(TODAY, offset))

describe('computeStreak', () => {
  it('is zero with no focus days', () => {
    expect(computeStreak([], TODAY)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak([day(0), day(-1), day(-2)], TODAY)).toBe(3)
  })

  it('counts a streak ending yesterday when today is empty', () => {
    expect(computeStreak([day(-1), day(-2)], TODAY)).toBe(2)
  })

  it('breaks when the gap reaches two days back', () => {
    expect(computeStreak([day(-2), day(-3)], TODAY)).toBe(0)
  })

  it('stops at the first gap in the run', () => {
    expect(computeStreak([day(0), day(-1), day(-3)], TODAY)).toBe(2)
  })

  it('ignores duplicate and out-of-order days', () => {
    expect(computeStreak([day(-2), day(0), day(0), day(-1)], TODAY)).toBe(3)
  })
})
