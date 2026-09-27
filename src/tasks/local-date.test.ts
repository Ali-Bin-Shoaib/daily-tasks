import { describe, expect, it } from 'vitest'
import { formatLongDate, localDateKey } from './local-date.ts'

describe('local dates', () => {
  it('uses the local calendar day', () => {
    expect(localDateKey(new Date(2026, 8, 27, 23, 30))).toBe('2026-09-27')
  })

  it('formats a stored date in the requested locale', () => {
    expect(formatLongDate('2026-09-27', 'en-US')).toBe('Sunday, September 27, 2026')
  })
})
