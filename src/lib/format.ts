const longDate = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Melbourne',
})

export function formatLongDate(isoDate: string): string {
  return longDate.format(new Date(isoDate))
}
