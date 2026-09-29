import { describe, expect, test } from 'bun:test'
import { organisation } from '../../src/data/organisation'
import { isValidAbn } from '../../src/lib/abn'

describe('organisation facts', () => {
  test('publishes a valid ABN in its display form', () => {
    expect(isValidAbn(organisation.abn)).toBe(true)
    expect(organisation.abnDisplay).toBe('34 726 868 010')
  })

  test('links to one ACNC register entry and the matching ABN lookup', () => {
    expect(organisation.acnc.profileUrl).toStartWith(
      'https://www.acnc.gov.au/charity/charities/',
    )
    expect(organisation.acnc.peopleUrl).toBe(
      organisation.acnc.profileUrl.replace(/\/profile$/, '/people'),
    )
    expect(organisation.abnLookupUrl).toContain(organisation.abn)
  })

  test('names a president and gives every responsible person a role', () => {
    const { responsiblePeople } = organisation

    expect(responsiblePeople.some((person) => person.role.startsWith('President'))).toBe(true)
    for (const person of responsiblePeople) {
      expect(person.name.trim()).not.toBe('')
      expect(person.role.trim()).not.toBe('')
    }
  })

  test('acknowledges the Traditional Owners by name', () => {
    expect(organisation.acknowledgementOfCountry).toContain('Wadawurrung')
  })
})
