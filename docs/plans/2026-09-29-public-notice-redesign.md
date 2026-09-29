# "Public notice" Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild helping.group in the approved Direction B, "Public notice", so the first thing a visitor sees is that Helping Group is a verifiable, ACNC-registered charity.

**Architecture:**
- Every public fact about the charity lives in one typed data file, `src/data/organisation.ts`. That covers the ABN, the ACNC registration, the responsible people, the Acknowledgement of Country and the early supporters. It is guarded by an ABN checksum unit test.
- Three new or rewritten Astro components read from it: the header chip, `VerificationBand`, `Governance` and the footer.
- The existing Tailwind v4 colour names are remapped to Direction B values, which keeps churn in the inner pages small.
- Inter and Inter Tight are self-hosted through Astro 7's built-in Fonts API.

**Tech stack:** Astro 7.1, Tailwind CSS 4.3, TypeScript (strict), Bun 1.3 (`bun test`), Playwright + axe.

**Design source:** Paper file "Helping Group — Homepage refresh", artboards "B · Public notice — Desktop" and "B · Public notice — Mobile" (https://app.paper.design/file/01M3NFEQYESMWCAS7ZG3Z2BTRW).

**Verified facts:** from the ABR and the ACNC Charity Register, checked 29 Sep 2026.
- ABN 34 726 868 010. Registered 6 Aug 2020. Small charity. Income tax exempt. Not DGR.
- Last reported 23 Feb 2026. Next report due 31 Jan 2027.
- Responsible people: Daniel Ferguson (President), Daniel Gates (Vice-president), Kasenya Turner (Secretary), Alison Kemp (Treasurer), Grace Barelier (Director).

---

## Design tokens (Direction B)

| Token (existing name → new value) | Value | Use |
|---|---|---|
| `paper` | `#FFFFFF` | page ground |
| `paper-deep` | `#F1F4EF` | snowgum tint sections |
| `line` *(new)* | `#DDE3DA` | hairlines |
| `line-strong` *(new)* | `#CDD6CA` | table rules on tint |
| `ink` | `#0F1F16` | text, ink buttons, footer |
| `ink-soft` | `#4A5850` | secondary text |
| `ink-mist` *(new)* | `#AAB7AE` | secondary text on ink |
| `ink-fog` *(new)* | `#8FA095` | labels on ink |
| `forest` | `#1E4D33` | evergreen: primary buttons, links, eyebrows |
| `forest-deep` | `#173725` | hover |
| `leaf` | `#86C349` | the one bright moment: verification band, dots. **Never as text on white.** |
| `leaf-wash` *(new)* | `#D8EBC2` | status dot ring |
| `mint` | `#5FBE7B` | logo gradient end |
| `rust` | `#B8563D` | activated state, 000 and the focus ring only |

Type:
- Headings use **Inter Tight** 700 with tight letter spacing: display 112/104 at -0.045em, section 48/52 at -0.035em.
- Body text uses **Inter** 400 at 17–18/28.
- Labels are Inter 600 capitals at 13px, letter-spaced 0.08em.

---

### Task 0: Branch and baseline (needs the user's OK)

The Astro rewrite is currently uncommitted on `master`. That's why we branch in place rather than using a worktree: a worktree would not include the uncommitted files.

**Step 1:** Create the branch. It carries the uncommitted changes with it.

```bash
git checkout -b redesign/public-notice
```

**Step 2:** Commit the existing rewrite as a baseline. Ask the user first.

```bash
git add -A
git commit -m "chore: baseline Astro rewrite before public-notice redesign"
```

**Step 3:** Confirm that the baseline is green.

Run: `bun run test:unit && bun run build`
Expected: 3 pass, `9 page(s) built`.

---

### Task 1: ABN helpers

**Files:**
- Create: `src/lib/abn.ts`
- Test: `tests/unit/abn.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, test } from 'bun:test'
import { formatAbn, isValidAbn } from '../../src/lib/abn'

describe('ABN helpers', () => {
  test('accepts Helping Group’s registered ABN with or without spaces', () => {
    expect(isValidAbn('34726868010')).toBe(true)
    expect(isValidAbn('34 726 868 010')).toBe(true)
  })

  test('rejects a single mistyped digit', () => {
    expect(isValidAbn('34726868011')).toBe(false)
  })

  test('rejects values that are not eleven digits', () => {
    expect(isValidAbn('3472686801')).toBe(false)
    expect(isValidAbn('ABN34726868010')).toBe(false)
  })

  test('formats an ABN in the 2-3-3-3 groups used by the ABR', () => {
    expect(formatAbn('34726868010')).toBe('34 726 868 010')
  })
})
```

**Step 2:** Run `bun test tests/unit/abn.test.ts`
Expected: FAIL. The error is "Cannot find module '../../src/lib/abn'".

**Step 3: Implement.** The algorithm is the ABR's published check: subtract 1 from the first digit, multiply each digit by its weight, and the sum must be divisible by 89.

```ts
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
```

**Step 4:** Run `bun test tests/unit/abn.test.ts`
Expected: 4 pass.

**Step 5:** Commit.

```bash
git add src/lib/abn.ts tests/unit/abn.test.ts
git commit -m "feat: add ABN checksum and formatting helpers"
```

---

### Task 2: Shared date formatting

This task pulls the date formatting that `StatusPanel.astro` currently does inline into a shared helper, so the verification band can use it too.

**Files:**
- Create: `src/lib/format.ts`
- Test: `tests/unit/format.test.ts`

**Step 1: Failing test**

```ts
import { expect, test } from 'bun:test'
import { formatLongDate } from '../../src/lib/format'

test('formats ISO dates the way Australians read them', () => {
  expect(formatLongDate('2020-08-06')).toBe('6 August 2020')
  expect(formatLongDate('2026-07-27T11:54:10+10:00')).toBe('27 July 2026')
})
```

**Step 2:** Run `bun test tests/unit/format.test.ts`. Expected: FAIL (module not found).

**Step 3: Implement**

```ts
const longDate = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Melbourne',
})

export function formatLongDate(isoDate: string): string {
  return longDate.format(new Date(isoDate))
}
```

**Step 4:** Run `bun test tests/unit/format.test.ts`. Expected: 1 pass.

**Step 5:** Commit: `git add src/lib/format.ts tests/unit/format.test.ts && git commit -m "feat: add shared long-date formatter"`

---

### Task 3: Organisation facts

**Files:**
- Create: `src/data/organisation.ts`
- Test: `tests/unit/organisation.test.ts`

**Step 1: Failing test**

```ts
import { describe, expect, test } from 'bun:test'
import { organisation } from '../../src/data/organisation'
import { isValidAbn } from '../../src/lib/abn'

describe('organisation facts', () => {
  test('publishes a valid ABN in its display form', () => {
    expect(isValidAbn(organisation.abn)).toBe(true)
    expect(organisation.abnDisplay).toBe('34 726 868 010')
  })

  test('links to one ACNC register entry and the matching ABN lookup', () => {
    expect(organisation.acnc.profileUrl).toStartWith(
      'https://www.acnc.gov.au/charity/charities/',
    )
    expect(organisation.acnc.peopleUrl).toBe(
      organisation.acnc.profileUrl.replace(/\/profile$/, '/people'),
    )
    expect(organisation.abnLookupUrl).toContain(organisation.abn)
  })

  test('names a president and gives every responsible person a role', () => {
    const { responsiblePeople } = organisation

    expect(responsiblePeople.some((person) => person.role.startsWith('President'))).toBe(true)
    for (const person of responsiblePeople) {
      expect(person.name.trim()).not.toBe('')
      expect(person.role.trim()).not.toBe('')
    }
  })

  test('acknowledges the Traditional Owners by name', () => {
    expect(organisation.acknowledgementOfCountry).toContain('Wadawurrung')
  })
})
```

**Step 2:** Run `bun test tests/unit/organisation.test.ts`. Expected: FAIL (module not found).

**Step 3: Implement**

```ts
import { formatAbn } from '../lib/abn'

export type ResponsiblePerson = {
  name: string
  role: string
}

export type Supporter = {
  name: string
  logo: string
  logoWidth: number
  logoHeight: number
  /** Rendered height in px, tuned so logos look optically even. */
  displayHeight: number
}

const abn = '34726868010'
const acncCharityUrl =
  'https://www.acnc.gov.au/charity/charities/e19a1344-f4b1-eb11-8236-000d3a6ab783'

/**
 * Public, verifiable facts about Helping Group.
 * Every value must match the ACNC Charity Register or the Australian Business
 * Register. Update responsiblePeople whenever the ACNC register changes.
 */
export const organisation = {
  name: 'Helping Group',
  abn,
  abnDisplay: formatAbn(abn),
  structure: 'Incorporated not-for-profit, Victoria',
  taxStatus: 'Income tax exempt charity',
  contactEmail: 'contact@helping.group',
  acnc: {
    registeredOn: '2020-08-06',
    profileUrl: `${acncCharityUrl}/profile`,
    peopleUrl: `${acncCharityUrl}/people`,
  },
  abnLookupUrl: `https://abr.business.gov.au/ABN/View?abn=${abn}`,
  acknowledgementOfCountry:
    'Helping Group acknowledges the Wadawurrung people, Traditional Owners of the lands on which we live and work, and pays respect to Elders past and present.',
  responsiblePeople: [
    { name: 'Daniel Ferguson', role: 'President · Founder' },
    { name: 'Daniel Gates', role: 'Vice-president' },
    { name: 'Kasenya Turner', role: 'Secretary' },
    { name: 'Alison Kemp', role: 'Treasurer' },
    { name: 'Grace Barelier', role: 'Director' },
  ] satisfies ResponsiblePerson[],
  earlySupporters: [
    {
      name: 'Amazon Web Services',
      logo: '/icons/aws.png',
      logoWidth: 360,
      logoHeight: 215,
      displayHeight: 36,
    },
    {
      name: 'Australian Government Department of Foreign Affairs and Trade',
      logo: '/icons/dfat.png',
      logoWidth: 360,
      logoHeight: 167,
      displayHeight: 60,
    },
    {
      name: 'Youth Affairs Council Victoria',
      logo: '/icons/yacvic.png',
      logoWidth: 500,
      logoHeight: 163,
      displayHeight: 46,
    },
  ] satisfies Supporter[],
}
```

**Step 4:** Run `bun test tests/unit`. Expected: all pass (3 existing + 9 new).

**Step 5:** Commit: `git add src/data/organisation.ts tests/unit/organisation.test.ts && git commit -m "feat: add verified organisation facts"`

---

### Task 4: One-line status summary

The hero status column needs a short sentence, not the full panel copy.

**Files:**
- Modify: `src/lib/status.ts`
- Test: `tests/unit/status.test.ts`

**Step 1: Add failing tests** inside the existing `describe` block:

```ts
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
```

**Step 2:** Run `bun test tests/unit/status.test.ts`. Expected: 2 FAIL (`summary` is undefined).

**Step 3: Implement.** Add `summary: string` to `StatusPresentation`. Then set it in each branch of `getStatusPresentation`:

```ts
// activated branch
summary: isAvailable
  ? `Activated for ${regions}. Check official warnings before using Helping Homes.`
  : `Activated for ${regions}. The app is temporarily unavailable, so use official emergency information.`,

// standby branch
summary: isAvailable
  ? 'Not activated right now. Ready when it is needed.'
  : 'Not activated right now. The app is temporarily offline between emergencies.',
```

**Step 4:** Run `bun test tests/unit`. Expected: all pass.

**Step 5:** Commit: `git commit -am "feat: add one-line Helping Homes status summary"`

---

### Task 5: Charity verification e2e tests (red)

Write the end-to-end expectations now, so that Tasks 6–11 turn them green.

**Files:**
- Modify: `tests/e2e/site.spec.ts`

**Step 1:** Add the import at the top: `import { organisation } from '../../src/data/organisation'`. Then append:

```ts
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
```

**Step 2:** Run `bun run test:e2e`.
Expected: the new tests FAIL (no ABN in the footer, no band, no `#governance`, no `NGO`). The existing tests still pass.

**Step 3:** Commit: `git commit -am "test: specify charity verification on every page"`

---

### Task 6: Tokens, fonts and the logo

**Files:**
- Modify: `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/components/Logo.astro`
- Create: `public/icons/hg-leaf.svg`

**Step 1: Self-host the fonts.** In `astro.config.mjs`, change the import to `import { defineConfig, fontProviders } from 'astro/config'`. Then add a top-level `fonts` key:

```js
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter Tight',
      cssVariable: '--font-inter-tight',
      weights: [600, 700],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
```

In `BaseLayout.astro`:
1. Add `import { Font } from 'astro:assets'`.
2. Put `<Font cssVariable="--font-inter" preload={[{ weight: 400 }]} />` and `<Font cssVariable="--font-inter-tight" preload={[{ weight: 700 }]} />` right after the viewport meta.
3. Change `theme-color` to `#0f1f16`.

The first build downloads the fonts, so it needs network access. Later builds use Astro's cache.

**Step 2: Replace the `@theme` block** in `global.css`:

```css
@theme {
  --color-paper: #ffffff;
  --color-paper-deep: #f1f4ef;
  --color-line: #dde3da;
  --color-line-strong: #cdd6ca;
  --color-ink: #0f1f16;
  --color-ink-soft: #4a5850;
  --color-ink-mist: #aab7ae;
  --color-ink-fog: #8fa095;
  --color-forest: #1e4d33;
  --color-forest-deep: #173725;
  --color-leaf: #86c349;
  --color-leaf-wash: #d8ebc2;
  --color-mint: #5fbe7b;
  --color-rust: #b8563d;
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-inter-tight), var(--font-inter), system-ui, sans-serif;
}
```

This drops `leaf-bright`, `sky`, `sun` and the two shadow tokens. None of them are used outside `global.css`.

**Step 3: Rewrite the component classes** in `@layer components`:
- `.shell` becomes `width: min(100% - 2.5rem, 80rem)`. Delete the `@media (max-width: 639px)` override so the mobile gutter is 20px.
- `.section-space` becomes `padding-block: clamp(4.5rem, 8vw, 7rem)`.
- `.eyebrow` becomes `color: var(--color-forest); font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.08em; line-height: 1.25; text-transform: uppercase`.
- `.display-title` becomes `max-width: 14ch; font-family: var(--font-display); font-size: clamp(3.25rem, 8.4vw, 7rem); font-weight: 700; letter-spacing: -0.045em; line-height: 0.94; text-wrap: balance`.
- Add `.display-title--page { max-width: 18ch; font-size: clamp(2.75rem, 6vw, 5rem); line-height: 1 }` for inner-page titles.
- `.section-title` becomes `max-width: 20ch; font-family: var(--font-display); font-size: clamp(2.125rem, 4vw, 3rem); font-weight: 700; letter-spacing: -0.035em; line-height: 1.08; text-wrap: balance`.
- `.body-large` becomes `color: var(--color-ink-soft); font-size: clamp(1.0625rem, 1.5vw, 1.125rem); line-height: 1.62`.
- Shared button base for `.button-primary, .button-secondary, .button-light, .button-ink, .button-outline-ink`:
  - `min-height: 3.25rem; justify-content: space-between; gap: 1rem; border-radius: 0.375rem; padding: 0.875rem 1.25rem; font-size: 1rem; font-weight: 600`.
  - Keep the existing transition.
- Button variants:
  - `.button-primary`: forest background, white text; hover forest-deep.
  - `.button-secondary`: 1px `line` border, white background, ink text; hover ink border.
  - `.button-light`: white background, ink text; hover paper-deep.
  - `.button-ink`: ink background, white text; hover forest-deep.
  - `.button-outline-ink`: `rgb(15 31 22 / 0.4)` border, ink text; hover ink border.
- Add `.text-link`: `display: inline-flex; min-height: 2.75rem; align-items: center; gap: 0.4rem; color: var(--color-forest); font-weight: 600; text-decoration: underline; text-decoration-color: rgb(30 77 51 / 0.3); text-underline-offset: 5px`. On hover the decoration colour becomes forest.
- Add `.logo-mono { filter: grayscale(1) brightness(0.3); transition: filter 160ms ease }` and `a:hover .logo-mono, a:focus-visible .logo-mono { filter: none }`.
- `.card`: `border: 1px solid var(--color-line); border-radius: 0.5rem; background: white`.
- `.project-prose h2`: `font-weight: 700; letter-spacing: -0.035em`.
- `::selection`: leaf background with ink text.
- Delete `.civic-grid`, which is unused.
- Keep the rust `:focus-visible` ring. It stays above 3:1 contrast on white, leaf and ink.

**Step 4: Leaf mark.** Create `public/icons/hg-leaf.svg`. Its paths are copied from `public/social-card.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44" fill="none">
  <defs>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#86C349"/>
      <stop offset="1" stop-color="#5FBE7B"/>
    </linearGradient>
  </defs>
  <path d="M18.8798 28.2111C18.8798 28.2111 15.0112 38.7427 9.37036 43.9958H7.18787C9.11601 42.7396 15.1671 34.8219 18.8798 28.2111Z" fill="url(#leaf)"/>
  <path d="M12.6481 16.2499C12.6481 16.2499 16.9966 5.31231 22.8262 0H25.1112C23.3062 1.10391 16.5905 9.22887 12.6481 16.2499Z" fill="url(#leaf)"/>
  <path d="M30.56 20.1287C29.5755 23.1232 28.3611 27.598 27.8606 32.6354C27.1878 39.3689 23.6803 42.3423 21.8916 43.4377C21.5675 43.6365 21.1204 43.7803 20.7676 43.8691C20.4312 43.9537 19.4835 43.996 19.4835 43.996H14.4662C17.502 42.2661 20.9235 38.9248 22.6916 32.4874C22.6916 32.4874 24.6977 22.2477 26.1828 18.7541C26.1828 18.7541 17.379 22.345 11.7997 30.3219C6.19986 38.3242 5.85934 44.0003 5.85934 44.0003H3.86557C1.62975 43.9537 0.604161 40.9761 0.165202 37.5798C-0.421445 33.0372 0.682087 26.2954 1.47796 23.8718C2.46254 20.8773 3.67686 16.4024 4.17736 11.365C4.83375 4.80925 8.27979 1.97122 10.0028 0.655826C10.3269 0.406283 10.852 0.194824 11.4345 0.0933146C11.9515 0.000264499 12.5545 0.00448476 12.5545 0.00448476H17.8877C14.7616 1.67093 11.1228 5.01226 9.27667 11.7288C9.27667 11.7288 7.27058 21.9685 5.7855 25.4621C5.7855 25.4621 14.9708 22.1419 20.1686 13.8943C20.1686 13.8943 25.3336 6.73793 26.1171 0.00448476H28.115C30.3877 0.00448476 31.4257 3.00323 31.8687 6.42494C31.8851 6.55605 31.9015 6.68717 31.9138 6.81828C31.9631 8.13367 31.9877 9.5125 32 10.8321C31.84 14.5541 31.1221 18.4157 30.56 20.1287Z" fill="url(#leaf)"/>
</svg>
```

**Step 5: Logo.** Replace the body of `src/components/Logo.astro`, keeping its `Props` and defaults:

```astro
<span class="inline-flex items-center gap-2.5">
  <img src="/icons/hg-leaf.svg" alt="" width="32" height="44" class="h-9 w-auto" />
  {!compact && (
    <span
      class:list={[
        'font-display text-[1.3125rem] leading-none font-bold tracking-[-0.03em]',
        light ? 'text-white' : 'text-ink',
      ]}
    >
      Helping Group
    </span>
  )}
</span>
```

**Step 6: Fix label text that used `leaf`.** `leaf` is now too light to read as text on white. Replace `text-leaf` with `text-forest` in `src/pages/about.astro`, `src/pages/archive.astro`, `src/pages/404.astro` and `src/pages/projects/[slug].astro`. `bg-leaf` and `border-leaf` stay as they are.

**Step 7: Inner-page titles.** Add `display-title--page` next to `display-title` on the `h1` in `about.astro`, `archive.astro`, `projects/index.astro` and `projects/[slug].astro`. In `404.astro`, replace the h1's size utilities with `display-title display-title--page mx-auto`.

**Step 8:** Run `bun run check && bun run build`.
Expected: no errors. Built HTML contains `@font-face` for Inter.

**Step 9:** Commit: `git add -A && git commit -m "feat: apply public-notice tokens, self-hosted Inter and vector leaf logo"`

---

### Task 7: Header with the ACNC chip

**Files:** Modify `src/components/SiteHeader.astro`.

**Step 1:** Import `organisation` from `'../data/organisation'`.

**Step 2:** Replace the markup above `<script>` with the block below. Two things change in behaviour:
- The desktop nav now appears from `lg` rather than `md`, so the chip always fits.
- The chip hides below 360px, since the ABN is still in the band and the footer.

```astro
<header class="relative z-50 border-b border-line bg-paper">
  <div class="shell flex min-h-20 items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <a href="/" class="inline-flex min-h-12 items-center" aria-label="Helping Group home">
        <Logo />
      </a>
      <a
        class="hidden min-h-9 items-center gap-1.5 rounded-full border border-line py-1 pr-3 pl-2 text-[0.8125rem] font-semibold text-ink hover:border-ink min-[360px]:inline-flex"
        href={organisation.acnc.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ACNC registered charity: view our Charity Register entry (opens in a new tab)"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-3.5 shrink-0">
          <circle cx="12" cy="12" r="10" fill="#86C349"></circle>
          <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#0F1F16" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <span class="lg:hidden">ACNC</span>
        <span class="hidden lg:inline">ACNC registered charity</span>
      </a>
    </div>

    <nav class="hidden items-center gap-8 lg:flex" aria-label="Primary">
      {links.map((link) => (
        <a
          href={link.href}
          aria-current={isActive(link.href) ? 'page' : undefined}
          class:list={[
            'inline-flex min-h-11 items-center border-b-2 text-[0.9375rem] transition-colors',
            isActive(link.href)
              ? 'border-ink font-semibold text-ink'
              : 'border-transparent font-medium text-ink-soft hover:text-ink',
          ]}
        >
          {link.label}
        </a>
      ))}
      <a
        class="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-[0.9375rem] font-semibold text-white hover:bg-forest-deep"
        href={`mailto:${organisation.contactEmail}`}
      >
        Contact
      </a>
    </nav>

    <button
      type="button"
      class="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-ink text-white lg:hidden"
      aria-expanded="false"
      aria-controls="mobile-navigation"
      aria-label="Open menu"
      data-menu-toggle
    >
      <span data-menu-open-icon>
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 8h16M4 16h16"></path>
        </svg>
      </span>
      <span data-menu-close-icon hidden>
        <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="m6 6 12 12M18 6 6 18"></path>
        </svg>
      </span>
    </button>
  </div>

  <nav
    id="mobile-navigation"
    class="absolute inset-x-0 top-full border-b border-line bg-paper py-4 lg:hidden"
    aria-label="Mobile"
    data-mobile-menu
    hidden
  >
    <div class="shell flex flex-col">
      {links.map((link) => (
        <a
          href={link.href}
          aria-current={isActive(link.href) ? 'page' : undefined}
          class:list={[
            'flex min-h-12 items-center border-l-2 px-4 font-medium',
            isActive(link.href)
              ? 'border-ink text-ink'
              : 'border-transparent text-ink-soft hover:text-ink',
          ]}
        >
          {link.label}
        </a>
      ))}
      <a class="button-ink mt-3" href={`mailto:${organisation.contactEmail}`}>
        Contact Helping Group <span aria-hidden="true">→</span>
      </a>
    </div>
  </nav>
</header>
```

**Step 3:** In the `<script>`, change the resize breakpoint from `768` to `1024` so it matches `lg`.

**Step 4:** Run `bun run test:e2e -g "mobile menu|ACNC register"`.
Expected: the mobile menu test passes. The banner half of the ACNC test passes, and the footer half still fails.

**Step 5:** Commit: `git commit -am "feat: header ACNC chip and ink contact button"`

---

### Task 8: Footer

**Files:** Modify `src/components/SiteFooter.astro`.

**Step 1:** Replace the whole file:

```astro
---
import { socialLinks } from '../data/archive'
import { organisation } from '../data/organisation'

const explore = [
  { label: 'Helping Homes', href: '/projects/helping-homes' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Archive', href: '/archive' },
]
---

<footer class="bg-ink text-white">
  <div class="shell grid gap-12 py-16 md:grid-cols-[minmax(0,1fr)_auto] md:py-20">
    <div>
      <p class="max-w-md font-display text-3xl leading-tight font-bold tracking-[-0.035em] sm:text-[2.5rem]">
        Questions? Talk to a real person.
      </p>
      <a
        class="mt-5 inline-flex min-h-11 items-center text-lg font-semibold text-leaf underline underline-offset-[6px]"
        href={`mailto:${organisation.contactEmail}`}
      >
        {organisation.contactEmail}
      </a>
    </div>

    <div class="flex flex-wrap items-start gap-12 sm:gap-14">
      <nav aria-label="Footer">
        <p class="text-xs font-semibold tracking-[0.08em] text-ink-fog uppercase">Explore</p>
        <ul class="mt-4 space-y-3 text-[0.9375rem]">
          {explore.map((link) => (
            <li><a class="hover:text-leaf" href={link.href}>{link.label}</a></li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Social media">
        <p class="text-xs font-semibold tracking-[0.08em] text-ink-fog uppercase">Elsewhere</p>
        <ul class="mt-4 space-y-3 text-[0.9375rem]">
          {socialLinks.map((link) => (
            <li>
              <a class="hover:text-leaf" href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a
        class="shrink-0 rounded-full bg-white p-1"
        href={organisation.acnc.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="/icons/acnc.png"
          alt="ACNC Registered Charity tick: view our Charity Register entry (opens in a new tab)"
          width="288"
          height="288"
          loading="lazy"
          class="size-24"
        />
      </a>
    </div>
  </div>

  <div class="shell border-t border-white/10 py-7 text-sm">
    <p class="max-w-3xl leading-6 text-ink-mist">{organisation.acknowledgementOfCountry}</p>
    <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-ink-fog">
        <img src="/icons/hg-leaf.svg" alt="" width="32" height="44" class="h-5 w-auto" />
        <span>© {new Date().getFullYear()} Helping Group</span>
        <span aria-hidden="true">·</span>
        <span>ABN {organisation.abnDisplay}</span>
        <span aria-hidden="true">·</span>
        <span>Registered charity (ACNC)</span>
      </p>
      <p class="font-semibold">In an emergency, call 000.</p>
    </div>
  </div>
</footer>
```

**Step 2:** Run `bun run test:e2e -g "ACNC register"`.
Expected: PASS on all 8 routes, in both projects.

**Step 3:** Commit: `git commit -am "feat: ink footer with ACNC tick, ABN and Acknowledgement of Country"`

---

### Task 9: StatusPanel inline variant

**Files:** Modify `src/components/StatusPanel.astro`.

**Step 1:** Make these changes to the frontmatter:
1. Add `variant?: 'panel' | 'inline'` to `Props`, defaulting to `'panel'`.
2. Replace the inline `Intl.DateTimeFormat` with `const reviewedOn = formatLongDate(helpingHomesStatus.lastUpdated)`, importing it from `'../lib/format'`.
3. Import `organisation`.
4. Add `const activated = presentation.tone === 'activated'`.

**Step 2:** Wrap the existing `<section>` in `{variant === 'panel' && (...)}`. Inside it, change:
- `rounded-xl` → `rounded-lg`
- `border-forest/15 bg-white/75` → `border-line bg-white`
- heading `font-semibold` → `font-bold`
- `{formattedDate}` → `{reviewedOn}`
- `mailto:contact@helping.group` → `` {`mailto:${organisation.contactEmail}`} ``

Then add the inline variant:

```astro
{variant === 'inline' && (
  <section
    class="flex flex-col gap-2.5"
    aria-labelledby="helping-homes-status-heading"
    data-testid="helping-homes-status"
    data-mode={helpingHomesStatus.mode}
    data-availability={helpingHomesStatus.serviceAvailability}
  >
    <h2
      id="helping-homes-status-heading"
      class="flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.08em] text-ink uppercase"
    >
      <span
        class:list={[
          'size-2.5 shrink-0 rounded-full ring-2',
          activated ? 'bg-rust ring-rust/25' : 'bg-leaf ring-leaf-wash',
        ]}
        aria-hidden="true"
      ></span>
      Helping Homes · {presentation.eyebrow}
    </h2>
    <p class="leading-6 text-ink-soft">{presentation.summary}</p>
    <p class="text-sm text-ink-soft">
      Last reviewed <time datetime={helpingHomesStatus.lastUpdated}>{reviewedOn}</time>
    </p>
    {presentation.showServiceAction && (
      <a
        class="text-link"
        href={helpingHomesStatus.serviceUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="helping-homes-service-link"
      >
        Open Helping Homes <span aria-hidden="true">↗</span>
      </a>
    )}
    {activated && helpingHomesStatus.officialGuidance.map((link) => (
      <a class="text-link" href={link.url} target="_blank" rel="noopener noreferrer">
        {link.label} <span aria-hidden="true">↗</span>
      </a>
    ))}
    <p class="pt-1 text-sm font-medium text-ink">
      <strong class="mr-2 font-display font-bold text-rust">000</strong>In immediate danger? Call 000 first.
    </p>
  </section>
)}
```

**Step 3:** Run `bun run check`. Expected: no errors. (The homepage is wired up in Task 11.)

**Step 4:** Commit: `git commit -am "feat: inline Helping Homes status variant"`

---

### Task 10: VerificationBand and Governance components

**Files:**
- Create: `src/components/VerificationBand.astro`, `src/components/Governance.astro`

**Step 1: `VerificationBand.astro`**

```astro
---
import { organisation } from '../data/organisation'
import { formatLongDate } from '../lib/format'

const registeredOn = formatLongDate(organisation.acnc.registeredOn)
const facts = [
  {
    value: organisation.acnc.registeredOn.slice(0, 4),
    label: `Registered with the ACNC on ${registeredOn}`,
  },
  {
    value: organisation.abnDisplay,
    label: 'Our ABN. Look it up on the Australian Business Register any time.',
    wide: true,
  },
  {
    value: '$0',
    label: 'What we’ll ever ask you for. We don’t fundraise, and Helping Homes is free.',
  },
]
---

<section class="bg-leaf text-ink" aria-labelledby="verification-heading" data-testid="verification-band">
  <div class="shell grid gap-6 py-10 lg:grid-cols-[11rem_minmax(0,0.9fr)_minmax(0,1.6fr)_minmax(0,1fr)_13rem] lg:gap-0 lg:py-14">
    <div class="flex items-center justify-between lg:flex-col lg:items-start lg:pr-8">
      <h2 id="verification-heading" class="text-[0.8125rem] font-bold tracking-[0.08em] uppercase">
        Verified charity
      </h2>
      <a class="rounded-full bg-white p-1" href={organisation.acnc.profileUrl} target="_blank" rel="noopener noreferrer">
        <img
          src="/icons/acnc.png"
          alt="ACNC Registered Charity tick: view our Charity Register entry (opens in a new tab)"
          width="288"
          height="288"
          class="size-16 lg:size-22"
        />
      </a>
    </div>

    <dl class="contents">
      {facts.map((fact) => (
        <div class="flex flex-col gap-1 border-t border-ink/25 pt-4 lg:border-t-0 lg:border-l lg:px-8 lg:pt-0">
          <dt class="order-2 text-[0.9375rem] leading-6 font-medium lg:text-base">{fact.label}</dt>
          <dd class="order-1 font-display text-4xl leading-none font-bold tracking-[-0.04em] whitespace-nowrap tabular-nums lg:text-5xl">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>

    <div class="grid grid-cols-2 gap-2.5 pt-2 lg:flex lg:flex-col lg:justify-end lg:border-l lg:border-ink/25 lg:pt-0 lg:pl-8">
      <a class="button-ink" href={organisation.acnc.profileUrl} target="_blank" rel="noopener noreferrer">
        ACNC register <span class="text-leaf" aria-hidden="true">↗</span>
        <span class="sr-only">(opens in a new tab)</span>
      </a>
      <a class="button-outline-ink" href={organisation.abnLookupUrl} target="_blank" rel="noopener noreferrer">
        ABN Lookup <span aria-hidden="true">↗</span>
        <span class="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  </div>
</section>
```

Remove the unused `wide` flag if lint complains. The grid's column ratios already give the ABN the most room.

**Step 2: `Governance.astro`**

```astro
---
import { organisation } from '../data/organisation'
---

<section id="governance" class="section-space scroll-mt-8 bg-paper-deep" aria-labelledby="governance-heading">
  <div class="shell grid gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end lg:gap-10">
    <div>
      <p class="eyebrow">Governance</p>
      <h2 id="governance-heading" class="section-title mt-5">Who’s accountable.</h2>
      <table class="mt-10 w-full text-left">
        <caption class="sr-only">
          Helping Group’s responsible people, as listed on the ACNC Charity Register
        </caption>
        <thead>
          <tr class="border-b-2 border-ink">
            <th scope="col" class="w-2/5 pb-3 text-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">Name</th>
            <th scope="col" class="pb-3 text-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">Role</th>
          </tr>
        </thead>
        <tbody>
          {organisation.responsiblePeople.map((person) => (
            <tr class="border-b border-line-strong">
              <th scope="row" class="py-5 pr-6 text-lg font-semibold text-ink">{person.name}</th>
              <td class="py-5 text-ink-soft">{person.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a class="text-link mt-4" href={organisation.acnc.peopleUrl} target="_blank" rel="noopener noreferrer">
        Check our responsible people on the ACNC register <span aria-hidden="true">↗</span>
        <span class="sr-only">(opens in a new tab)</span>
      </a>
    </div>

    <aside class="border-t-[6px] border-ink bg-white p-7 sm:p-8" aria-labelledby="donations-notice-heading" data-testid="donations-notice">
      <p class="text-[0.8125rem] font-bold tracking-[0.08em] uppercase">Public notice</p>
      <h3 id="donations-notice-heading" class="mt-4 font-display text-[1.75rem] leading-tight font-bold tracking-[-0.03em]">
        We never ask for donations.
      </h3>
      <p class="mt-3.5 leading-7 text-ink-soft">
        Helping Group doesn’t fundraise from the public, and Helping Homes is,
        and always will be, free to use. If anyone asks you for money in our
        name, it isn’t us. Please tell us.
      </p>
      <a class="text-link mt-5" href={`mailto:${organisation.contactEmail}?subject=Report%20a%20donation%20request`}>
        Report it to {organisation.contactEmail}
      </a>
    </aside>
  </div>
</section>
```

**Step 3:** Run `bun run check && bun run lint`. Expected: clean.

**Step 4:** Commit: `git add src/components && git commit -m "feat: verification band and governance components"`

---

### Task 11: Rebuild the homepage

**Files:**
- Modify: `src/pages/index.astro`, `src/data/archive.ts`

**Step 1: Press logo sizing.** In `archive.ts`, extend `PressItem` with `logoWidth: number`, `logoHeight: number` and `displayHeight: number`. Set these values:

| Outlet | Width × height | Display height |
|---|---|---|
| The Courier | 716 × 130 | 28 |
| 9Now | 639 × 138 | 30 |
| AFR | 710 × 78 | 18 |
| Stock & Land | 722 × 104 | 24 |
| Student Edge | 389 × 200 | 44 |

**Step 2: Replace the frontmatter and `<main>`** of `index.astro`. Keep `BaseLayout`, its props, `SiteHeader` and `SiteFooter`. Remove the unused `archiveArticles` import.

```astro
---
import { getCollection } from 'astro:content'
import Governance from '../components/Governance.astro'
import SiteFooter from '../components/SiteFooter.astro'
import SiteHeader from '../components/SiteHeader.astro'
import StatusPanel from '../components/StatusPanel.astro'
import VerificationBand from '../components/VerificationBand.astro'
import { verifiedPress } from '../data/archive'
import { organisation } from '../data/organisation'
import BaseLayout from '../layouts/BaseLayout.astro'

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order)
const archivedProjects = projects.filter((project) => project.data.status === 'archived')
const offers = [
  ['Accommodation', 'A spare room, home or safe place to stay.'],
  ['Paddock space', 'Temporary space for livestock, horses and other animals.'],
  ['Transport', 'Help moving people, animals or essential belongings.'],
]
---
```

Main sections, in order:

```astro
<main id="main-content">
  <section aria-labelledby="hero-heading">
    <div class="shell pt-14 sm:pt-22">
      <p class="eyebrow">Not-for-profit · Australia · Since 2020</p>
      <h1 id="hero-heading" class="display-title mt-6">Practical support in difficult moments.</h1>
      <div class="grid gap-10 pt-12 pb-14 md:grid-cols-2 lg:grid-cols-[31rem_19rem_minmax(0,1fr)] lg:pb-18">
        <p class="body-large">
          Helping Group is the Australian charity behind Helping Homes, a
          seasonal service that connects people affected by bushfires, floods
          and other emergencies with a spare room, paddock space or transport
          offered by their community.
        </p>
        <div class="flex flex-col gap-3 lg:border-l lg:border-line lg:pl-10">
          <a class="button-primary" href="/projects/helping-homes">
            Explore Helping Homes <span class="arrow text-leaf" aria-hidden="true">→</span>
          </a>
          <a class="button-secondary" href="/about">
            How we began <span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <div class="border-t-2 border-ink pt-6 md:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l lg:border-line lg:pt-0 lg:pl-10">
          <StatusPanel variant="inline" />
        </div>
      </div>
    </div>
  </section>

  <VerificationBand />

  <section id="initiatives" class="section-space scroll-mt-8" aria-labelledby="connects-heading">
    <div class="shell grid gap-12 lg:grid-cols-[31rem_minmax(0,1fr)] lg:gap-10">
      <div>
        <p class="eyebrow">What Helping Homes connects</p>
        <h2 id="connects-heading" class="section-title mt-5">Community offers, in one place.</h2>
        <p class="mt-5 max-w-md leading-7 text-ink-soft">
          In an emergency, help is often already out there. It’s just
          scattered. Helping Homes makes it easier to find, without replacing
          official warnings or emergency services.
        </p>
        <a class="text-link mt-5" href="/projects/helping-homes">
          See how Helping Homes works <span class="arrow" aria-hidden="true">→</span>
        </a>
      </div>
      <ol class="border-t-2 border-ink">
        {offers.map(([title, copy], index) => (
          <li class="grid gap-2 border-b border-line py-7 sm:grid-cols-[3rem_15rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
            <span class="font-display text-xl font-bold text-forest" aria-hidden="true">0{index + 1}</span>
            <h3 class="font-display text-[2rem] leading-9 font-bold tracking-[-0.03em]">{title}</h3>
            <p class="leading-6 text-ink-soft">{copy}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>

  <Governance />

  <section id="media" class="scroll-mt-8 pt-20 sm:pt-24" aria-labelledby="evidence-heading">
    <div class="shell">
      <div class="flex flex-col gap-5 pb-10 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="evidence-heading" class="section-title max-w-[17ch]">On the record since the Black Summer fires.</h2>
        <p class="max-w-md text-[0.9375rem] leading-6 text-ink-soft">
          Coverage and early support from Helping Homes’ first season, shown as
          a historical record, not current partnerships.
        </p>
      </div>
      <div class="grid gap-6 border-t-2 border-ink border-b border-b-line py-9 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-center">
        <h3 class="text-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">In the news · Summer 2019–20</h3>
        <ul class="flex flex-wrap items-center gap-x-12 gap-y-6 lg:justify-between">
          {verifiedPress.map((item) => (
            <li>
              <a class="inline-flex min-h-11 items-center" href={item.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.logo}
                  alt={`${item.name}: ${item.description} (opens in a new tab)`}
                  width={item.logoWidth}
                  height={item.logoHeight}
                  style={`height:${item.displayHeight}px`}
                  loading="lazy"
                  class="logo-mono w-auto"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div class="grid gap-6 border-b border-line py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-center">
        <h3 class="text-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">Early supporters</h3>
        <ul class="flex flex-wrap items-center gap-x-16 gap-y-6">
          {organisation.earlySupporters.map((supporter) => (
            <li>
              <img
                src={supporter.logo}
                alt={supporter.name}
                width={supporter.logoWidth}
                height={supporter.logoHeight}
                style={`height:${supporter.displayHeight}px`}
                loading="lazy"
                class="logo-mono w-auto"
              />
            </li>
          ))}
        </ul>
      </div>
      <a class="text-link mt-4" href="/archive">Explore the full archive</a>
    </div>
  </section>

  <section class="section-space" aria-labelledby="origin-heading">
    <div class="shell">
      <h2 id="origin-heading" class="eyebrow">How it began · Summer 2019–20</h2>
      <blockquote class="mt-7 max-w-[26ch] font-display text-4xl leading-[1.1] font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
        <p>“Could people with a spare room or property make it easier for someone evacuating to find a safe place to stay?”</p>
      </blockquote>
      <div class="mt-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        <p class="max-w-xl text-[1.0625rem] leading-7 text-ink-soft">
          Daniel Ferguson started Helping Homes during the Black Summer
          bushfires. Helping Group formed around that response, and the same
          practical question still guides everything we do.
        </p>
        <a class="button-secondary shrink-0" href="/about#founder">
          Read our story <span class="arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </section>

  <section class="pb-24" aria-labelledby="archive-projects-heading">
    <div class="shell">
      <div class="flex items-baseline justify-between border-b-2 border-ink pb-4">
        <h2 id="archive-projects-heading" class="text-[0.8125rem] font-semibold tracking-[0.08em] uppercase">
          Earlier ideas · archived
        </h2>
        <a class="text-link" href="/projects">All projects <span class="arrow" aria-hidden="true">→</span></a>
      </div>
      <ul class="grid gap-10 pt-7 md:grid-cols-3">
        {archivedProjects.map((project) => (
          <li>
            <a class="group flex flex-col gap-2.5" href={`/projects/${project.data.slug}`}>
              <h3 class="font-display text-2xl font-bold tracking-[-0.02em] group-hover:text-forest">{project.data.title}</h3>
              <p class="text-[0.9375rem] leading-6 text-ink-soft">{project.data.summary}</p>
              <span class="pt-1.5 text-sm font-semibold text-forest">Case study <span class="arrow" aria-hidden="true">→</span></span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
</main>
```

The quote is taken word for word from `src/content/projects/helping-homes.md`, so it traces to a listed source.

**Step 3:** Run `bun run test:e2e`.
Expected: everything passes except the `/about` half of the governance test and the JSON-LD test.

**Step 4:** Commit: `git commit -am "feat: rebuild homepage in the public-notice direction"`

---

### Task 12: About page governance and structured data

**Files:**
- Modify: `src/pages/about.astro`, `src/layouts/BaseLayout.astro`

**Step 1:** Make these changes in `about.astro`:
1. Import `Governance` and render `<Governance />` directly after the `#founder` section.
2. Change the founder image `src` to `/icons/hg-leaf.svg`, with width 32 and height 44.
3. Change the founder `mailto:` to use `organisation.contactEmail`.

**Step 2:** In `BaseLayout.astro`, import `organisation` and replace `organisationData`:

```ts
const organisationData = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: organisation.name,
  url: 'https://helping.group',
  logo: 'https://helping.group/icons/hg-colour.png',
  email: organisation.contactEmail,
  taxID: organisation.abnDisplay,
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'ABN',
    value: organisation.abn,
  },
  foundingDate: organisation.acnc.registeredOn,
  areaServed: { '@type': 'Country', name: 'Australia' },
  founder: { '@type': 'Person', name: 'Daniel Ferguson' },
  sameAs: [organisation.acnc.profileUrl, ...socialLinks.map((link) => link.url)],
}
```

**Step 3:** Run `bun run test:e2e`. Expected: all pass, including axe, on both desktop and mobile.

**Step 4:** Commit: `git commit -am "feat: governance on About and ABN in structured data"`

---

### Task 13: Documentation

**Files:** Modify `README.md`.

**Step 1:** Add this section after "Edit project content":

```markdown
## Edit charity details

Helping Group's verifiable facts live in `src/data/organisation.ts`: ABN, ACNC
registration, responsible people, Acknowledgement of Country and early
supporters. Every value must match the
[ACNC Charity Register](https://www.acnc.gov.au/charity/charities/e19a1344-f4b1-eb11-8236-000d3a6ab783/profile)
or the Australian Business Register.

- When the board changes on the ACNC register, update `responsiblePeople`.
- The unit tests reject an ABN that fails the ABR checksum.
- The site never asks for donations. Keep the public notice accurate if that
  ever changes.
```

**Step 2:** Commit: `git commit -am "docs: explain where charity details live"`

---

### Task 14: Verify end to end

**Step 1:** Run `bun run check && bun run lint && bun run test:unit && bun run test:e2e && bun run build && bun audit`.
Expected: every step succeeds with 0 axe violations.

**Step 2: Visual check.** Run `bun run preview` and open it in the built-in browser. Compare it against the Paper artboards "B · Public notice — Desktop / Mobile" at 1440×900 and 390×844. Check:
- The headline wraps to two lines on desktop.
- The ABN fits on one line in the band.
- The press logos look optically even.
- There is no sideways scroll at 320px.

**Step 3:** Hand the branch to the user for a Vercel preview before it's merged.

---

## Follow-ups for the user (not code)

1. **Email mismatch.** The ACNC register lists `hi@helpinggroup.com.au` and `contact@helpinggroup.com.au`, but the site uses `contact@helping.group`. Update one side so visitors who cross-check see the same address.
2. **Early supporters' dates.** The label says "Early supporters" with no years. Add a period once it's confirmed.
3. **Social cards.** `public/social-card.svg` and `helping-homes-og.svg` still use the old palette. They could be refreshed later.
