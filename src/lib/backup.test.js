import { describe, expect, it } from 'vitest'
import { evaluateReminder } from './backup.js'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.parse('2026-10-08T00:00:00.000Z')
const daysAgo = (n) => new Date(NOW - n * DAY).toISOString()
const empty = { at: '', count: 0, snoozedAt: '' }

describe('evaluateReminder', () => {
  it('문구가 없으면 백업을 권하지 않는다', () => {
    expect(evaluateReminder({ quoteCount: 0, state: empty, now: NOW })).toBe(null)
  })

  it('한 번도 백업한 적이 없으면 바로 권한다', () => {
    const result = evaluateReminder({ quoteCount: 3, state: empty, now: NOW })
    expect(result).toEqual({ unsaved: 3, days: null, never: true })
  })

  it('백업 뒤 새 문구가 없으면 권하지 않는다', () => {
    const state = { at: daysAgo(30), count: 5, snoozedAt: '' }
    expect(evaluateReminder({ quoteCount: 5, state, now: NOW })).toBe(null)
  })

  it('새 문구가 있어도 백업한 지 일주일이 안 됐으면 기다린다', () => {
    const state = { at: daysAgo(2), count: 5, snoozedAt: '' }
    expect(evaluateReminder({ quoteCount: 8, state, now: NOW })).toBe(null)
  })

  it('일주일이 지나고 새 문구가 있으면 권한다', () => {
    const state = { at: daysAgo(9), count: 5, snoozedAt: '' }
    expect(evaluateReminder({ quoteCount: 8, state, now: NOW })).toEqual({
      unsaved: 3,
      days: 9,
      never: false,
    })
  })

  it('쌓인 문구가 많으면 기간과 상관없이 권한다', () => {
    const state = { at: daysAgo(1), count: 0, snoozedAt: '' }
    expect(evaluateReminder({ quoteCount: 25, state, now: NOW })?.unsaved).toBe(25)
  })

  it('나중에를 누르면 사흘 동안 조용하다', () => {
    const state = { at: '', count: 0, snoozedAt: daysAgo(1) }
    expect(evaluateReminder({ quoteCount: 9, state, now: NOW })).toBe(null)
    const old = { at: '', count: 0, snoozedAt: daysAgo(4) }
    expect(evaluateReminder({ quoteCount: 9, state: old, now: NOW })?.never).toBe(true)
  })
})
