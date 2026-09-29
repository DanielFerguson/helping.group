import { describe, expect, test } from 'bun:test'
import { formatAbn, isValidAbn } from '../../src/lib/abn'

describe('ABN helpers', () => {
  test('accepts Helping Group’s registered ABN with or without spaces', () => {
    expect(isValidAbn('34726868010')).toBe(true)
    expect(isValidAbn('34 726 868 010')).toBe(true)
  })

  test('rejects a single mistyped digit', () => {
    expect(isValidAbn('34726868011')).toBe(false)
  })

  test('rejects values that are not eleven digits', () => {
    expect(isValidAbn('3472686801')).toBe(false)
    expect(isValidAbn('ABN34726868010')).toBe(false)
  })

  test('formats an ABN in the 2-3-3-3 groups used by the ABR', () => {
    expect(formatAbn('34726868010')).toBe('34 726 868 010')
  })
})
