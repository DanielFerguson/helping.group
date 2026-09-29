const longDate = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Melbourne',
})

export function formatLongDate(isoDate: string): string {
  return longDate.format(new Date(isoDate))
}

const time = new Intl.DateTimeFormat('en-AU', {
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
  timeZone: 'Australia/Melbourne',
})

/** e.g. `29 September 2026, 2:15 pm AEST` (Melbourne time, plain spaces). */
export function formatLongDateTime(iso: string): string {
  return `${formatLongDate(iso)}, ${time.format(new Date(iso))}`.replace(
    /\s/g,
    ' ',
  )
}
