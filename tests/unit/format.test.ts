import { expect, test } from 'bun:test'
import { formatLongDate } from '../../src/lib/format'

test('formats ISO dates the way Australians read them', () => {
  expect(formatLongDate('2020-08-06')).toBe('6 August 2020')
  expect(formatLongDate('2026-07-27T11:54:10+10:00')).toBe('27 July 2026')
})
