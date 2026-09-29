export type NavLink = { label: string; href: string }

export const navLinks: NavLink[] = [
  { label: 'Helping Homes', href: '/projects/helping-homes' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Archive', href: '/archive' },
]

const HELPING_HOMES = '/projects/helping-homes'

/** Whether a nav link is the current section for a pathname (trailing slashes ignored). */
export function isNavActive(pathname: string, href: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  const inHelpingHomes =
    path === HELPING_HOMES || path.startsWith(`${HELPING_HOMES}/`)

  if (href === HELPING_HOMES) return inHelpingHomes
  if (href === '/projects') {
    return (
      (path === '/projects' || path.startsWith('/projects/')) && !inHelpingHomes
    )
  }
  return path === href || path.startsWith(`${href}/`)
}
