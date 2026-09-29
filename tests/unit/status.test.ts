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

describe('Helping Homes status page content', () => {
  const standby: StandbyStatus = {
    ...base,
    mode: 'standby',
    serviceAvailability: 'unavailable',
  }
  const activated: ActivatedStatus = {
    ...base,
    mode: 'activated',
    serviceAvailability: 'available',
    incident: {
      name: 'Western District fires',
      regions: ['Ballarat', 'Pyrenees'],
      guidanceUrl: 'https://www.emergency.vic.gov.au/',
    },
  }

  test('a standby service has a calm headline, no regions and a review date', () => {
    const result = getStatusPresentation(standby)

    expect(result.headline).toBe('Ready for the next emergency.')
    expect(result.regions).toEqual([])
    expect(result.updatedLabel).toBe('Last reviewed')
  })

  test('an activation names the incident, its regions and an update date', () => {
    const result = getStatusPresentation(activated)

    expect(result.headline).toBe('Responding to Western District fires.')
    expect(result.regions).toEqual(['Ballarat', 'Pyrenees'])
    expect(result.updatedLabel).toBe('Last updated')
  })

  test('a standby service links only to the general official guidance', () => {
    expect(getStatusPresentation(standby).officialLinks).toEqual(
      base.officialGuidance,
    )
  })

  test('an activation puts the incident guidance ahead of the general guidance', () => {
    const { officialLinks } = getStatusPresentation(activated)

    expect(officialLinks[0]).toEqual({
      label: 'Official guidance for this incident',
      url: 'https://www.emergency.vic.gov.au/',
    })
    expect(officialLinks.slice(1)).toEqual(base.officialGuidance)
  })
})

describe('Helping Homes status-driven page behaviour', () => {
  const incident = {
    name: 'Western District fires',
    regions: ['Ballarat', 'Pyrenees'],
    guidanceUrl: 'https://www.emergency.vic.gov.au/',
  }
  const cases = {
    'standby and available': {
      ...base,
      mode: 'standby',
      serviceAvailability: 'available',
    } satisfies StandbyStatus,
    'standby and unavailable': {
      ...base,
      mode: 'standby',
      serviceAvailability: 'unavailable',
    } satisfies StandbyStatus,
    'activated and available': {
      ...base,
      mode: 'activated',
      serviceAvailability: 'available',
      incident,
    } satisfies ActivatedStatus,
    'activated and unavailable': {
      ...base,
      mode: 'activated',
      serviceAvailability: 'unavailable',
      incident,
    } satisfies ActivatedStatus,
  }

  test('the primary action is the service, contact or an unavailable notice', () => {
    expect(getStatusPresentation(cases['standby and available']).primaryAction).toBe('service')
    expect(getStatusPresentation(cases['standby and unavailable']).primaryAction).toBe('contact')
    expect(getStatusPresentation(cases['activated and available']).primaryAction).toBe('service')
    expect(getStatusPresentation(cases['activated and unavailable']).primaryAction).toBe(
      'unavailable-notice',
    )
  })

  test('the primary action always agrees with showServiceAction', () => {
    for (const status of Object.values(cases)) {
      const result = getStatusPresentation(status)

      expect(result.primaryAction === 'service').toBe(result.showServiceAction)
    }
  })

  test('official links sit above the action only while activated', () => {
    expect(getStatusPresentation(cases['standby and available']).officialLinksAboveAction).toBe(false)
    expect(getStatusPresentation(cases['standby and unavailable']).officialLinksAboveAction).toBe(false)
    expect(getStatusPresentation(cases['activated and available']).officialLinksAboveAction).toBe(true)
    expect(getStatusPresentation(cases['activated and unavailable']).officialLinksAboveAction).toBe(true)
  })

  test('a standby service leaves the lead to the page', () => {
    expect(getStatusPresentation(cases['standby and available']).lead).toBeNull()
    expect(getStatusPresentation(cases['standby and unavailable']).lead).toBeNull()
  })

  test('an activation with the app available leads with the description', () => {
    const result = getStatusPresentation(cases['activated and available'])

    expect(result.lead).toBe(result.description)
    expect(result.lead).toContain('Check official warnings')
  })

  test('an activation with the app unavailable does not send people to the app', () => {
    const { lead } = getStatusPresentation(cases['activated and unavailable'])

    expect(lead).toBe('The service has been activated for Ballarat, Pyrenees.')
    expect(lead).not.toContain('before using Helping Homes')
  })

  test('the About timeline describes a standby service as ready, not active', () => {
    for (const key of ['standby and available', 'standby and unavailable'] as const) {
      const result = getStatusPresentation(cases[key])

      expect(result.timelineTitle).toBe('Helping Homes on standby')
      expect(result.timelineSummary).toBe(
        'The service is kept ready for the next emergency. It isn’t activated right now.',
      )
    }
  })

  test('the About timeline names the incident and regions while activated', () => {
    for (const key of ['activated and available', 'activated and unavailable'] as const) {
      const result = getStatusPresentation(cases[key])

      expect(result.timelineTitle).toBe('Helping Homes is responding to Western District fires')
      expect(result.timelineSummary).toBe(
        'Activated for Ballarat, Pyrenees. See the Helping Homes page for the latest.',
      )
    }
  })
})
