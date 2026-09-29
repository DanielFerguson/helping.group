import type { HelpingHomesStatus } from '../data/helping-homes-status'

export type StatusPresentation = {
  eyebrow: string
  title: string
  description: string
  summary: string
  availabilityNote: string | null
  showServiceAction: boolean
  tone: 'standby' | 'activated'
  headline: string
  regions: string[]
  updatedLabel: 'Last reviewed' | 'Last updated'
  officialLinks: { label: string; url: string }[]
  /** What the hero offers first: the service, a way to contact us, or a notice that the app is down. */
  primaryAction: 'service' | 'contact' | 'unavailable-notice'
  /** Whether the official warnings come before the primary action. */
  officialLinksAboveAction: boolean
  /** The hero lead while activated; `null` on standby, where the page has its own lead. */
  lead: string | null
  /** The "Today" entry in the About page's dated record. */
  timelineTitle: string
  timelineSummary: string
}

export function getStatusPresentation(
  status: HelpingHomesStatus,
): StatusPresentation {
  const isAvailable = status.serviceAvailability === 'available'

  if (status.mode === 'activated') {
    const regions = status.incident.regions.join(', ')
    const description = `The service has been activated for ${regions}. Check official warnings before using Helping Homes.`

    return {
      eyebrow: 'Activated',
      title: `Helping Homes is responding to ${status.incident.name}`,
      description,
      summary: isAvailable
        ? `Activated for ${regions}. Check official warnings before using Helping Homes.`
        : `Activated for ${regions}. The app is temporarily unavailable, so use official emergency information.`,
      availabilityNote: isAvailable
        ? null
        : 'The Helping Homes application is temporarily unavailable. Use official emergency information or contact Helping Group.',
      showServiceAction: isAvailable,
      tone: 'activated',
      headline: `Responding to ${status.incident.name}.`,
      regions: status.incident.regions,
      updatedLabel: 'Last updated',
      officialLinks: [
        {
          label: 'Official guidance for this incident',
          url: status.incident.guidanceUrl,
        },
        ...status.officialGuidance,
      ],
      primaryAction: isAvailable ? 'service' : 'unavailable-notice',
      officialLinksAboveAction: true,
      // Don't tell people to check warnings before using an app that is down.
      lead: isAvailable ? description : `The service has been activated for ${regions}.`,
      timelineTitle: `Helping Homes is responding to ${status.incident.name}`,
      timelineSummary: `Activated for ${regions}. See the Helping Homes page for the latest.`,
    }
  }

  return {
    eyebrow: 'On standby',
    title: 'Helping Homes is ready when it is needed',
    description:
      'The service is not currently activated. We keep it ready to help connect people affected by emergencies with practical offers of support.',
    summary: isAvailable
      ? 'Not activated right now. Ready when it is needed.'
      : 'Not activated right now. The app is temporarily offline between emergencies.',
    availabilityNote: isAvailable
      ? null
      : 'The Helping Homes application is temporarily unavailable while the service remains on standby.',
    showServiceAction: isAvailable,
    tone: 'standby',
    headline: 'Ready for the next emergency.',
    regions: [],
    updatedLabel: 'Last reviewed',
    officialLinks: status.officialGuidance,
    primaryAction: isAvailable ? 'service' : 'contact',
    officialLinksAboveAction: false,
    lead: null,
    timelineTitle: 'Helping Homes on standby',
    timelineSummary:
      'The service is kept ready for the next emergency. It isn’t activated right now.',
  }
}
