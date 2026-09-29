import { describe, expect, test } from 'bun:test'
import { isNavActive, navLinks } from '../../src/lib/nav'

const activeLabels = (pathname: string) =>
  navLinks
    .filter((link) => isNavActive(pathname, link.href))
    .map((link) => link.label)

describe('navigation links', () => {
  test('lists the four sections in order', () => {
    expect(navLinks.map((link) => link.label)).toEqual([
      'Helping Homes',
      'Projects',
      'About',
      'Archive',
    ])
  })
})

describe('navigation state', () => {
  test('marks only Helping Homes on its own page, with or without a trailing slash', () => {
    expect(activeLabels('/projects/helping-homes')).toEqual(['Helping Homes'])
    expect(activeLabels('/projects/helping-homes/')).toEqual(['Helping Homes'])
  })

  test('does not mark Projects while on the Helping Homes page', () => {
    expect(isNavActive('/projects/helping-homes', '/projects')).toBe(false)
    expect(isNavActive('/projects/helping-homes/', '/projects')).toBe(false)
  })

  test('marks Projects on the index and on archived project pages, not Helping Homes', () => {
    for (const path of ['/projects', '/projects/', '/projects/our-move']) {
      expect(activeLabels(path)).toEqual(['Projects'])
      expect(isNavActive(path, '/projects/helping-homes')).toBe(false)
    }
  })

  test('marks About with or without a trailing slash', () => {
    expect(activeLabels('/about')).toEqual(['About'])
    expect(activeLabels('/about/')).toEqual(['About'])
  })

  test('marks Archive on its page', () => {
    expect(activeLabels('/archive')).toEqual(['Archive'])
  })

  test('marks nothing on the homepage or an unknown page', () => {
    expect(activeLabels('/')).toEqual([])
    expect(activeLabels('/this-page-does-not-exist')).toEqual([])
  })

  test('does not match a sibling path that merely shares a prefix', () => {
    expect(activeLabels('/aboutus')).toEqual([])
    expect(activeLabels('/projects-old')).toEqual([])
  })
})
