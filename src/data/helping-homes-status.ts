export type ServiceAvailability = 'available' | 'unavailable'

type OfficialGuidance = {
  label: string
  url: string
}

type BaseStatus = {
  serviceAvailability: ServiceAvailability
  lastUpdated: string
  serviceUrl: string
  officialGuidance: OfficialGuidance[]
}

export type StandbyStatus = BaseStatus & {
  mode: 'standby'
  incident?: never
}

export type ActivatedStatus = BaseStatus & {
  mode: 'activated'
  incident: {
    name: string
    regions: string[]
    guidanceUrl: string
  }
}

export type HelpingHomesStatus = StandbyStatus | ActivatedStatus

/**
 * This file is the public source of truth for Helping Homes' operational state.
 * Update lastUpdated whenever the mode or availability changes.
 */
export const helpingHomesStatus = {
  mode: 'standby',
  serviceAvailability: 'unavailable',
  lastUpdated: '2026-07-27T11:54:10+10:00',
  serviceUrl: 'https://helpinghomes.com.au',
  officialGuidance: [
    {
      label: 'Australian emergency information',
      url: 'https://www.australia.gov.au/emergency-information',
    },
  ],
} satisfies HelpingHomesStatus
