const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

export function normaliseAbn(value: string): string {
  return value.replace(/\s+/g, '')
}

/** Validates an ABN using the Australian Business Register's checksum. */
export function isValidAbn(value: string): boolean {
  const digits = normaliseAbn(value)
  if (!/^\d{11}$/.test(digits)) return false

  const sum = [...digits].reduce((total, character, index) => {
    const digit = Number(character) - (index === 0 ? 1 : 0)
    return total + digit * (ABN_WEIGHTS[index] ?? 0)
  }, 0)

  return sum % 89 === 0
}

export function formatAbn(value: string): string {
  const digits = normaliseAbn(value)
  return [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 8),
    digits.slice(8),
  ].join(' ')
}
