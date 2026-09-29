import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { archiveArticles } from '../../src/data/archive'
import { organisation } from '../../src/data/organisation'
import { formatLongDate } from '../../src/lib/format'

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

test.describe('external links', () => {
  for (const route of publicRoutes) {
    test(`links opened in a new tab are protected on ${route}`, async ({
      page,
    }) => {
      await page.goto(route)

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

test('the open mobile menu keeps keyboard focus off the page behind it', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile')

  await page.goto('/about')
  const toggle = page.locator('[data-menu-toggle]')
  const menu = page.getByRole('navigation', { name: 'Mobile' })
  const expectPageInert = async (inert: boolean) => {
    for (const behind of ['main', 'footer', '.skip-link']) {
      await expect(page.locator(behind)).toHaveJSProperty('inert', inert)
    }
  }
  // Focus may sit in the header, or leave the document (into the browser's
  // own controls); it must never land in the page behind the menu.
  const focusIsBehindMenu = () =>
    page.evaluate(() => {
      const active = document.activeElement
      return (
        active !== null &&
        active !== document.body &&
        active.closest('header') === null
      )
    })

  await expectPageInert(false)
  await toggle.click()
  await expect(menu).toBeVisible()
  await expectPageInert(true)

  // Tab well past the last link in the menu.
  const stops = (await menu.locator('a').count()) + 4
  for (let index = 0; index < stops; index += 1) {
    await page.keyboard.press('Tab')
    expect(await focusIsBehindMenu()).toBe(false)
  }

  // Every way of closing the menu gives the page back.
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expectPageInert(false)

  await toggle.click()
  await expectPageInert(true)
  await toggle.click()
  await expect(menu).toBeHidden()
  await expectPageInert(false)

  await toggle.click()
  await expectPageInert(true)
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(menu).toBeHidden()
  await expectPageInert(false)
})

test.describe('accessibility', () => {
  for (const route of [...publicRoutes, '/this-page-does-not-exist']) {
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
          .locator(`a[href="${organisation.acnc.profileUrl}"]`)
          .first(),
      ).toBeVisible()
    })
  }
})

test('the verification band links to both public registers', async ({
  page,
}) => {
  await page.goto('/')
  const band = page.getByTestId('verification-band')

  await expect(band).toContainText('6 August 2020')
  await expect(band).not.toContainText(organisation.abnDisplay)
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
  await page.evaluate(() => document.fonts.ready)
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  )

  expect(overflow).toBeLessThanOrEqual(0)
})

const archivedSlugs = ['rainbow-restoration', 'our-move', 'whats-my-impact']

test.describe('navigation state', () => {
  const cases = [
    ['/projects/helping-homes', 'Helping Homes'],
    ['/projects', 'Projects'],
    ['/projects/our-move', 'Projects'],
    ['/about', 'About'],
    ['/archive', 'Archive'],
  ] as const

  for (const [route, label] of cases) {
    test(`${route} marks ${label} as the current page`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop')

      await page.goto(route)
      const current = page
        .getByRole('navigation', { name: 'Primary' })
        .locator('[aria-current="page"]')

      await expect(current).toHaveCount(1)
      await expect(current).toHaveText(label)
    })
  }
})

test('Helping Homes has its own service page', async ({ page }) => {
  await page.goto('/projects/helping-homes')

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Ready for the next emergency',
  )
  const status = page.getByTestId('helping-homes-status')
  await expect(status).toHaveAttribute('data-mode', 'standby')
  await expect(status).toHaveAttribute('data-availability', 'unavailable')
  await expect(status).toContainText('Last reviewed')
  await expect(status).toContainText('call 000', { ignoreCase: true })
  await expect(page.getByTestId('helping-homes-notice')).toContainText(
    /replace 000/,
  )
  await expect(page.getByTestId('season-steps').locator('li')).toHaveCount(3)
  await expect(page.getByText('You are here')).toHaveCount(0)
})

for (const slug of archivedSlugs) {
  test(`/projects/${slug} is an archived record without imagery`, async ({
    page,
  }) => {
    await page.goto(`/projects/${slug}`)

    await expect(page.getByTestId('archived-status')).toContainText('Archived')
    await expect(page.getByTestId('archived-notice')).toBeVisible()
    await expect(page.locator('main img')).toHaveCount(0)
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }),
    ).toContainText('Projects')
    await expect(page.getByRole('link', { name: /All projects/ })).toBeVisible()
  })
}

test('/projects lists archived ideas as a record without imagery', async ({
  page,
}) => {
  await page.goto('/projects')

  await expect(
    page.getByTestId('archived-projects').locator('li'),
  ).toHaveCount(3)
  await expect(page.locator('main img')).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: /Explore the service/ }),
  ).toHaveAttribute('href', '/projects/helping-homes')
})

test('/archive shows four articles and five press reports', async ({ page }) => {
  await page.goto('/archive')

  await expect(page.getByTestId('archive-articles').locator('li')).toHaveCount(4)
  // The heading names the article; the new-tab hint belongs to the link only.
  const articleHeadings = page
    .getByTestId('archive-articles')
    .getByRole('heading', { level: 3 })
  await expect(articleHeadings).toHaveCount(4)
  await expect(
    articleHeadings.filter({ hasText: /opens in a new tab/ }),
  ).toHaveCount(0)
  for (const [index, article] of archiveArticles.entries()) {
    await expect(articleHeadings.nth(index)).toHaveAccessibleName(article.title)
  }
  const press = page.getByTestId('archive-press').locator('li')
  await expect(press).toHaveCount(5)
  await expect(page.getByTestId('archive-press').locator('img')).toHaveCount(5)
})

test('/about shows the dated record and the registration record', async ({
  page,
}) => {
  await page.goto('/about')

  await expect(page.locator('#founder')).toBeVisible()
  await expect(page.getByTestId('dated-record').locator('li')).toHaveCount(4)
  await expect(page.getByTestId('dated-record')).toContainText(
    'Helping Homes on standby',
  )
  const record = page.getByTestId('registration-record')
  await expect(record).toContainText(organisation.abnDisplay)
  await expect(record).toContainText(organisation.charity.size)
  await expect(record).toContainText(
    formatLongDate(organisation.charity.lastReportedOn),
  )
  await expect(record).toContainText(
    formatLongDate(organisation.charity.nextReportDue),
  )
  await expect(record).toContainText('not tax-deductible', { ignoreCase: true })
})

test('the 404 page keeps the site chrome and the emergency line', async ({
  page,
}) => {
  await page.goto('/this-page-does-not-exist')

  await expect(
    page
      .getByRole('banner')
      .locator(`a[href="${organisation.acnc.profileUrl}"]`)
      .first(),
  ).toBeVisible()
  await expect(page.locator('footer')).toContainText(
    `ABN ${organisation.abnDisplay}`,
  )
  await expect(page.getByTestId('emergency-line')).toContainText('000')
})

test('the open mobile menu carries the charity chip and the 000 line', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile')

  await page.goto('/about')
  await page.locator('[data-menu-toggle]').click()
  const menu = page.getByRole('navigation', { name: 'Mobile' })

  await expect(menu).toContainText('ACNC registered charity')
  await expect(menu).toContainText('Call 000')
  await expect(
    menu.locator('[data-mobile-nav-link][aria-current="page"]'),
  ).toHaveText('About')
  for (const link of await menu.locator('[data-mobile-nav-link]').all()) {
    const box = await link.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48)
  }

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test.describe('narrow phones', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  for (const route of [...publicRoutes, '/this-page-does-not-exist']) {
    test(`${route} does not scroll sideways at 320px`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile')

      await page.goto(route)
      await page.evaluate(() => document.fonts.ready)
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      )

      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
