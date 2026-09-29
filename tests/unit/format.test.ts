import { expect, test } from 'bun:test'
import {
  formatLongDate,
  formatLongDateTime,
  formatShortDate,
} from '../../src/lib/format'

test('formats ISO dates the way Australians read them', () => {
  expect(formatLongDate('2020-08-06')).toBe('6 August 2020')
  expect(formatLongDate('2026-07-27T11:54:10+10:00')).toBe('27 July 2026')
})

test('formats compact dates with an abbreviated month', () => {
  expect(formatShortDate('2020-08-06')).toBe('6 Aug 2020')
  expect(formatShortDate('2026-07-27T11:54:10+10:00')).toBe('27 Jul 2026')
})

test('formats a date and time in Melbourne time with the zone name', () => {
  const format = (iso: string) => formatLongDateTime(iso).replace(/\s/g, ' ')

  expect(format('2026-09-29T14:15:00+10:00')).toBe(
    '29 September 2026, 2:15 pm AEST',
  )
})

test('the zone name follows daylight saving in Melbourne', () => {
  const format = (iso: string) => formatLongDateTime(iso).replace(/\s/g, ' ')

  expect(format('2026-07-27T11:54:10+10:00')).toBe(
    '27 July 2026, 11:54 am AEST',
  )
  expect(format('2026-12-25T09:00:00+11:00')).toBe(
    '25 December 2026, 9:00 am AEDT',
  )
})

test('uses plain spaces in the formatted date and time', () => {
  expect(formatLongDateTime('2026-09-29T14:15:00+10:00')).not.toMatch(
    /[\u00a0\u202f]/,
  )
})
