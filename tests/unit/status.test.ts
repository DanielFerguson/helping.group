import { describe, expect, test } from 'bun:test'
import type {
  ActivatedStatus,
  StandbyStatus,
} from '../../src/data/helping-homes-status'
import { getStatusPresentation } from '../../src/lib/status'

const base = {
  lastUpdated: '2026-07-27T11:54:10+10:00',
  serviceUrl: 'https://helpinghomes.com.au',
  officialGuidance: [
    {
      label: 'Emergency information',
      url: 'https://www.australia.gov.au/emergency-information',
    },
  ],
}

describe('Helping Homes status presentation', () => {
  test('describes a healthy standby service without manufacturing urgency', () => {
    const status: StandbyStatus = {
      ...base,
      mode: 'standby',
      serviceAvailability: 'available',
    }

    const result = getStatusPresentation(status)

    expect(result.title).toContain('ready when it is needed')
    expect(result.eyebrow).toBe('On standby')
    expect(result.showServiceAction).toBe(true)
    expect(result.availabilityNote).toBeNull()
  })

  test('names an active incident and its affected regions', () => {
    const status: ActivatedStatus = {
      ...base,
      mode: 'activated',
      serviceAvailability: 'available',
      incident: {
        name: 'Western District fires',
        regions: ['Ballarat', 'Pyrenees'],
        guidanceUrl: 'https://www.emergency.vic.gov.au/',
      },
    }

    const result = getStatusPresentation(status)

    expect(result.title).toContain('Western District fires')
    expect(result.description).toContain('Ballarat, Pyrenees')
    expect(result.eyebrow).toBe('Activated')
    expect(result.showServiceAction).toBe(true)
  })

  test('suppresses the application action when the service is unavailable', () => {
    const status: StandbyStatus = {
      ...base,
      mode: 'standby',
      serviceAvailability: 'unavailable',
    }

    const result = getStatusPresentation(status)

    expect(result.showServiceAction).toBe(false)
    expect(result.availabilityNote).toContain('temporarily unavailable')
  })
})
