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

  test('summarises an offline standby service in one line', () => {
    const status: StandbyStatus = {
      ...base,
      mode: 'standby',
      serviceAvailability: 'unavailable',
    }

    expect(getStatusPresentation(status).summary).toBe(
      'Not activated right now. The app is temporarily offline between emergencies.',
    )
  })

  test('summarises an activation with its regions', () => {
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

    expect(getStatusPresentation(status).summary).toContain(
      'Activated for Ballarat, Pyrenees.',
    )
  })

  test('summarises an available standby service in one line', () => {
    const status: StandbyStatus = {
      ...base,
      mode: 'standby',
      serviceAvailability: 'available',
    }

    expect(getStatusPresentation(status).summary).toBe(
      'Not activated right now. Ready when it is needed.',
    )
  })

  test('summarises an activation while the app is unavailable', () => {
    const status: ActivatedStatus = {
      ...base,
      mode: 'activated',
      serviceAvailability: 'unavailable',
      incident: {
        name: 'Western District fires',
        regions: ['Ballarat', 'Pyrenees'],
        guidanceUrl: 'https://www.emergency.vic.gov.au/',
      },
    }

    expect(getStatusPresentation(status).summary).toBe(
      'Activated for Ballarat, Pyrenees. The app is temporarily unavailable, so use official emergency information.',
    )
  })
})
