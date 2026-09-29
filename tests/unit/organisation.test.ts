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

  test('records the charity register details with valid, ordered dates', () => {
    const { charity } = organisation

    expect(charity.size).toBe('Small')
    expect(charity.incomeTaxExempt).toBe(true)
    expect(charity.deductibleGiftRecipient).toBe(false)
    for (const date of [charity.lastReportedOn, charity.nextReportDue]) {
      expect(Number.isNaN(Date.parse(date))).toBe(false)
    }
    expect(Date.parse(charity.nextReportDue)).toBeGreaterThan(
      Date.parse(charity.lastReportedOn),
    )
  })

  test('the next report is no more than 30 days overdue', () => {
    // Deliberate yearly reminder: after each Annual Information Statement,
    // update organisation.charity from the ACNC Charity Register. The 30 day
    // grace window allows for a late filing before this starts to fail.
    const graceMs = 30 * 24 * 60 * 60 * 1000

    expect(
      Date.parse(organisation.charity.nextReportDue) + graceMs,
    ).toBeGreaterThan(Date.now())
  })
})
