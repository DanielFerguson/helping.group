import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { organisation } from '../../src/data/organisation'

const publicRoutes = [
  '/',
  '/about',
  '/projects',
  '/projects/helping-homes',
  '/projects/rainbow-restoration',
  '/projects/our-move',
  '/projects/whats-my-impact',
  '/archive',
]

test.describe('public routes', () => {
  for (const route of publicRoutes) {
    test(`${route} renders with a title and one primary heading`, async ({
      page,
    }) => {
      const response = await page.goto(route)

      expect(response?.ok()).toBe(true)
      await expect(page).toHaveTitle(/Helping Group/)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        /.+/,
      )
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`https://helping\\.group${route === '/' ? '/?' : route}`),
      )
    })
  }
})

test('the homepage retains legacy section anchors', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#initiatives')).toBeVisible()
  await expect(page.locator('#media')).toBeVisible()
})

test('standby and technical availability are explicit', async ({ page }) => {
  await page.goto('/')

  const panel = page.getByTestId('helping-homes-status')
  await expect(panel).toHaveAttribute('data-mode', 'standby')
  await expect(panel).toHaveAttribute('data-availability', 'unavailable')
  await expect(panel).toContainText('On standby')
  await expect(panel).toContainText('call 000', { ignoreCase: true })
  await expect(
    page.getByTestId('helping-homes-service-link'),
  ).toHaveCount(0)
})

test('the unavailable service is not linked from its case study', async ({
  page,
}) => {
  await page.goto('/projects/helping-homes')

  await expect(
    page.locator('a[href="https://helpinghomes.com.au"]'),
  ).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Contact Helping Group' }),
  ).toBeVisible()
})

test('archived projects do not link to retired service domains', async ({
  page,
}) => {
  await page.goto('/projects')

  await expect(page.locator('a[href*="ourmove.com.au"]')).toHaveCount(0)
  await expect(page.locator('a[href*="whatsmyimpact.com.au"]')).toHaveCount(0)
})

test('external links opened in a new tab are protected', async ({ page }) => {
  await page.goto('/archive')

  const externalLinks = page.locator('a[target="_blank"]')
  const count = await externalLinks.count()
  expect(count).toBeGreaterThan(0)

  for (let index = 0; index < count; index += 1) {
    await expect(externalLinks.nth(index)).toHaveAttribute(
      'rel',
      /noopener.*noreferrer|noreferrer.*noopener/,
    )
  }
})

test('the former team route redirects to the founder story', async ({
  page,
}) => {
  await page.goto('/team')

  await expect(page).toHaveURL(/\/about#founder$/)
  await expect(page.locator('#founder')).toBeVisible()
})

test('unknown routes use the custom 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'This page isn’t here',
  )
})

test('the mobile menu is keyboard safe', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile')

  await page.goto('/')
  const toggle = page.locator('[data-menu-toggle]')

  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
})

test.describe('accessibility', () => {
  for (const route of [
    '/',
    '/about',
    '/projects',
    '/projects/helping-homes',
    '/archive',
  ]) {
    test(`${route} has no automatically detectable violations`, async ({
      page,
    }) => {
      await page.goto(route)
      const results = await new AxeBuilder({ page }).analyze()

      expect(results.violations).toEqual([])
    })
  }
})

test.describe('charity verification', () => {
  for (const route of publicRoutes) {
    test(`${route} shows the ABN and links to the ACNC register`, async ({
      page,
    }) => {
      await page.goto(route)
      const footer = page.locator('footer')

      await expect(footer).toContainText(`ABN ${organisation.abnDisplay}`)
      await expect(footer).toContainText('Wadawurrung')
      await expect(
        footer.locator(`a[href="${organisation.acnc.profileUrl}"]`),
      ).toHaveCount(1)
      await expect(
        page
          .getByRole('banner')
          .locator(`a[href="${organisation.acnc.profileUrl}"]`),
      ).toBeVisible()
    })
  }
})

test('the verification band links to both public registers', async ({
  page,
}) => {
  await page.goto('/')
  const band = page.getByTestId('verification-band')

  await expect(band).toContainText(organisation.abnDisplay)
  await expect(band).toContainText('6 August 2020')
  await expect(
    band.locator(`a[href="${organisation.abnLookupUrl}"]`),
  ).toBeVisible()
  await expect(
    band.locator(`a[href="${organisation.acnc.profileUrl}"]`).first(),
  ).toBeVisible()
})

test('the responsible people match the register data', async ({ page }) => {
  for (const route of ['/', '/about']) {
    await page.goto(route)
    const governance = page.locator('#governance')

    for (const person of organisation.responsiblePeople) {
      await expect(
        governance.getByRole('rowheader', { name: person.name }),
      ).toBeVisible()
    }
    await expect(
      governance.locator(`a[href="${organisation.acnc.peopleUrl}"]`),
    ).toBeVisible()
  }
})

test('the homepage warns that Helping Group never asks for money', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByTestId('donations-notice')).toContainText(
    'We never ask for donations',
  )
})

test('structured data identifies the charity by its ABN', async ({ page }) => {
  await page.goto('/')
  const json = await page
    .locator('script[type="application/ld+json"]')
    .textContent()
  const items = JSON.parse(json ?? '[]') as Array<Record<string, unknown>>
  const charity = items.find((item) => item['@type'] === 'NGO')

  expect(charity?.taxID).toBe(organisation.abnDisplay)
  expect(charity?.sameAs).toContain(organisation.acnc.profileUrl)
})

test('the homepage never scrolls sideways', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )

  expect(overflow).toBeLessThanOrEqual(0)
})
