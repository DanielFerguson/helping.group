# Inner pages in the "Public notice" direction: implementation plan

## Context

The homepage redesign is merged (PR #1). Every other page still has the old structure with only the new tokens applied: `about.astro`, `archive.astro`, `projects/index.astro`, `projects/[slug].astro`, `404.astro` and the mobile menu dropdown. The design for all of them is finished and approved, in Paper (file `01M3NFEQYESMWCAS7ZG3Z2BTRW`, page "Inner pages — B · Public notice"), with the written spec in `docs/plans/2026-09-29-inner-pages-design.md` (decisions and confirmed facts are in its "Resolved questions").

This plan builds that design in the Astro codebase: one branch, one PR, subagent-driven, TDD where there's logic, e2e specs written red first.

**Goal:** Build Helping Homes as its own service page (standby and activated), plus About, Projects, archived projects, Archive, 404 and the open mobile menu, in Direction B.

**Architecture:** Six shared components (the "Shared patterns" in the design doc) and a few CSS ledger classes. All charity facts stay in `src/data/organisation.ts`. Helping Homes page copy is driven by the existing status file through `getStatusPresentation`. Nav state logic is extracted to `src/lib/nav.ts` so it's unit-tested.

**Tech stack:** Astro 7.3, Tailwind 4.3, TypeScript strict, `bun test`, Playwright + axe. Bun 1.4.2 (run scripts as `bunx bun@1.4.2 run <script>` to match Vercel).

## Ground rules

- **Branch:** `feature/inner-pages`, created from `docs/inner-pages-decisions` (master + the decisions doc commit). Never work on `master`. Don't push until the user says so.
- **Visual source of truth:** the Paper artboards below. For each page, the implementer takes a `get_screenshot` (and `get_jsx` for exact values and copy) of the desktop and mobile artboards, builds the page, then screenshots the built page at 1440×900 and 390×844 and compares. Copy is taken verbatim from Paper unless this plan says otherwise. Use `mcp__Paper__*` tools (ToolSearch to load them), always pass `fileId`.
- **Conventions:** no semicolons, single quotes, 2-space indent, trailing commas. Existing tokens and classes in `src/styles/global.css` (`.shell`, `.section-space`, `.eyebrow`, `.section-title`, `.display-title--page`, `.button-*`, `.text-link`, `.logo-mono`). Leaf is never text on white. Rust only for activated state, `000` and focus. Grey marks archived.
- **Don't touch the homepage** (`index.astro`, `VerificationBand`) beyond what a shared component requires.

### Paper artboards (page `p-2-0`)

| Page | Desktop | Mobile |
|---|---|---|
| Helping Homes, standby | `K2-0` | `OA-0` |
| Helping Homes, activated | `V3-0` | `17L-0` |
| Activated, app unavailable (hero only) | `1KZ-0` | — |
| About | `QG-0` | `QH-0` |
| Projects | `TR-0` | `TS-0` |
| Archived project (Our Move) | `TT-0` | `TU-0` |
| Archive | `O8-0` | `O9-0` |
| 404 | `P2-0` | `P3-0` |
| Mobile menu (open) | — | `P4-0` |

Notes beside each page group (`1TG-0`, `QI-0`, `TV-0`, `TW-0`, `PP-0`, `PQ-0`, `PR-0`) list the copy sources.

## Deviations from the design, decided in this plan

1. **Archived notice copy.** The design says "It isn't operating any more." That is wrong for Rainbow Restoration, which never operated (its md says it "remained a concept"). Use: title "This project is archived." and body "It isn't active. We keep it here as part of the record." The status line stays `ARCHIVED · NOT OPERATING`. At the end, update the Paper text on `TT-0`, `TU-0` and the note `TW-0` to match.
2. **Record table is not one component.** Real `<table>` markup is used only for genuinely tabular data (the governance people table, unchanged). Ledgers (projects, articles, dated record, registration record, press) are `<ul>`/`<dl>` rows with `.ledger` / `.ledger-row` CSS plus a per-page grid. That keeps table semantics intact on mobile.
3. **`period` on archived projects** ("Archived project") is shown as designed, though it repeats the status. Left as a known follow-up (real dates would read better); no content invented.

## New data and behaviour

### `src/data/organisation.ts` — add `charity`

```ts
charity: {
  size: 'Small',
  incomeTaxExempt: true,
  deductibleGiftRecipient: false,
  lastReportedOn: '2026-02-23',
  nextReportDue: '2027-01-31',
},
```

### `src/lib/nav.ts` — new (unit-tested)

```ts
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
  const inHelpingHomes = path === HELPING_HOMES || path.startsWith(`${HELPING_HOMES}/`)

  if (href === HELPING_HOMES) return inHelpingHomes
  if (href === '/projects') {
    return (path === '/projects' || path.startsWith('/projects/')) && !inHelpingHomes
  }
  return path === href || path.startsWith(`${href}/`)
}
```
`SiteHeader.astro` and `SiteFooter.astro` import `navLinks` / `isNavActive`; their inline `links`/`explore` arrays and `isActive` go away. Today `/projects/our-move` wrongly leaves Projects inactive.

### `src/lib/format.ts` — add `formatLongDateTime`

`formatLongDateTime('2026-09-29T14:15:00+10:00')` → "29 September 2026, 2:15 pm AEST" (Australia/Melbourne; build from `formatLongDate` + an `en-AU` `{hour, minute, timeZoneName: 'short'}` formatter). Test with whitespace normalised (`/\s/g` → space) because ICU may emit U+202F before "pm".

### `src/lib/status.ts` — extend `StatusPresentation`

Add: `headline` ("Ready for the next emergency." | `Responding to ${incident.name}.`), `regions: string[]` ([] | incident.regions), `updatedLabel` ('Last reviewed' | 'Last updated'), `officialLinks` (standby: `status.officialGuidance`; activated: `[{ label: 'Official guidance for this incident', url: incident.guidanceUrl }, ...status.officialGuidance]`). Leave existing fields alone.

## Shared components (`src/components/`)

| Component | Props / slots | Notes |
|---|---|---|
| `StatusLine.astro` | `tone: 'standby' \| 'activated' \| 'archived'`, `as?: 'p' \| 'h2' \| 'div'`, `id?`; default slot = label | Dot: leaf+`leaf-wash` ring / rust+`rust-wash` ring / `ink-soft`+`line` ring. Add `--color-rust-wash: #f0d5cc` to `@theme`. `StatusPanel` inline variant switches to it. |
| `PageHero.astro` | `title`; slots `top`, default (lead), `actions`, `aside` | Renders the single `h1` (`id="page-title"`), 2-column row (lead+actions / aside with left rule) from `lg`. Retune `.display-title--page` to Paper: about `clamp(2.75rem, 5.5vw + 1.875rem, 5.5rem)`, line-height .95, `overflow-wrap: break-word`. Must not overflow at 320px. |
| `SplitSection.astro` | `eyebrow`, `title`, `id` (required), `tone?: 'white' \| 'tint'`; slots `intro`, default | 5fr/8fr grid from `lg` (matches Paper 460/780). `section-title` h2 with `aria-labelledby`. |
| `NumberedRows.astro` | `items: {title, copy}[]`, `onTint?: boolean` | `<ol>`, heavy ink top rule; mobile: number+title on one line, copy below (`col-start-2`); `sm:` 3 columns. Rule colour `line-strong` when `onTint`. |
| `NoticeBlock.astro` | `variant?: 'standard' \| 'activated' \| 'muted'`, `title`, `headingId`, `label?`, `testid?`; slots default, `actions` | 6px top rule: ink / rust / `line`. Muted uses `ink-soft` text. `Governance.astro`'s inline notice switches to this (keep `data-testid="donations-notice"`); give `Governance` a `tone?: 'tint' \| 'white'` prop (About uses white, homepage tint). |
| `SourceList.astro` | `links: {label, href, external?}[]`, `label?` | Heavy top rule, hairline rows, trailing ↗ (external, with `sr-only` "(opens in a new tab)", `target=_blank rel="noopener noreferrer"`) or → (internal). |

CSS additions to `global.css` `@layer components`: `.ledger` (`border-top: 2px solid ink`, list-style none, padding 0) and `.ledger-row` (`border-bottom: 1px solid var(--ledger-line, var(--color-line))`, padding-block 1.25rem). `html.menu-open { overflow: hidden }`.

## Test IDs (used by both e2e and pages)

`helping-homes-status` (HH hero aside; data-mode, data-availability), `helping-homes-notice`, `season-steps`, `archived-status`, `archived-notice`, `archived-projects`, `archive-articles`, `archive-press`, `dated-record`, `registration-record`, `emergency-line` (404), `donations-notice` (exists), `verification-band` (exists).

## Pages

**Helping Homes — new `src/pages/projects/helping-homes.astro`.** Also filter `[slug].astro`'s `getStaticPaths` to `status === 'archived'`. Metadata (title, summary, hero for the OG image, sources) still come from `helping-homes.md` via `getEntry`; JSON-LD kept as `CreativeWork`. Sections, all driven by `getStatusPresentation(helpingHomesStatus)`:
1. Hero: `StatusLine` "Helping Homes · {eyebrow}", title = `headline`. Standby lead is the static paragraph from `K2-0`; activated lead is `presentation.description`. Aside (testid `helping-homes-status`): standby → summary, "Last reviewed <date>", 000 line; activated → "Affected regions", "Last updated <date time>" (`formatLongDateTime`), 000 line. Actions: activated → "Official warnings" `SourceList` (`officialLinks`) **above** the button; button = `showServiceAction` ? "Open Helping Homes ↗" (external) : "Contact Helping Group →" (mailto). Activated and app unavailable → an activated `NoticeBlock` (availability note + official links + contact button) replaces the service button (see `1KZ-0`).
2. Offers (tint): `NumberedRows` — Accommodation, Paddock space, Transport (copy from `K2-0`).
3. Season (white): heading + intro ("…The Helping Group board decides when to activate: when Australia has a natural disaster, and when good Samaritans are offering temporary accommodation to its victims at a scale that needs our intervention."), three steps (`data-testid="season-steps"`, `<ol>`). Standby: coloured dots, no chip. Activated: step 02 filled rust dot + "You are here" chip, steps 01/03 hollow grey. Step 01 copy includes the map and two-week offer expiry text.
4. "What it isn't" (tint): `NoticeBlock` standard (activated variant when activated), testid `helping-homes-notice`, official link from `officialLinks`.
5. The record (white): condensed story + `SourceList` (the md source, "How Helping Group began" → `/about#founder`).

**Archived project — rewrite `[slug].astro`.** Hero: breadcrumb `<nav aria-label="Breadcrumb">` (Projects / Title), `StatusLine tone="archived"` (testid `archived-status`) "Archived · Not operating" + period, title, summary. Muted `NoticeBlock` (testid `archived-notice`, copy per deviation 1) in a tint band. `NumberedRows` 01 challenge / 02 response / 03 where it stands (full `outcome`). Case study: `SplitSection` tint with prose column ≈680px (`.project-prose`). Sources: `SourceList` + "← All projects" link. **No images on the page** (`hero` stays for the OG image and JSON-LD). Delete `ProjectCard.astro`.

**Projects — rewrite `projects/index.astro`.** Hero (headline/lead from `TR-0`). Continuing (tint): one large row — title, md summary, `StatusLine` + `presentation.summary` + "Last reviewed", "Explore the service →". Archived (white, testid `archived-projects`): `.ledger` rows, order from md `order`: project | what it explored | status (grey dot `ARCHIVED` + period) | "Case study →". Column header row `aria-hidden`, hidden below `md`. No images.

**About — rewrite `about.astro`.** Sections (tone in brackets), copy verbatim from `QG-0`/`QH-0`: hero (white) → How it began (tint, keeps `id="founder"`, founder note with "President and founder") → Dated record (white, testid `dated-record`, 4 rows: Summer 2019–20, 6 Aug 2020, 2020–21 with grey ARCHIVED tag, Today with leaf ON STANDBY tag) → How we work (tint, `NumberedRows`) → `<Governance tone="white" />` → Registration record (tint, testid `registration-record`, `<dl>` ledger from `organisation`: ABN, registered date (`formatLongDate`), size, tax status, DGR "No" + "Donations are not tax-deductible.", last reported, next report due; links "View our ACNC register entry ↗" / "Look up our ABN ↗").

**Archive — rewrite `archive.astro`.** Hero with "On this page" index (links to `#articles`, `#press`, counts). Articles (tint, id `articles`, testid `archive-articles`): `.ledger` rows date | category | title ↗ + description, newest first (existing data order). Press (white, id `press`, testid `archive-press`): rows with mono logo (`.logo-mono`, sizes from `verifiedPress` `displayHeight`, real `alt` text), outlet, description, "Read ↗"; note that coverage doesn't imply a current partnership.

**404 — rewrite `404.astro`.** Add `SiteHeader` + `SiteFooter`; `main` with eyebrow "Error 404", `h1` "This page isn’t here." (keep the curly apostrophe), lead, buttons "Return home" (primary) and "Browse projects" (secondary), then the 000 line (testid `emergency-line`) under an ink rule. Keep `noIndex`. Height from padding, not fixed.

**Mobile menu — `SiteHeader.astro`.** Panel (`nav aria-label="Mobile"`, `data-mobile-menu`) becomes full-height: `absolute inset-x-0 top-full h-[calc(100dvh-5rem)] overflow-y-auto`, flex column. Nav rows `data-mobile-nav-link`: Inter Tight 700 ~34px, ≥76px tall, hairline dividers, current page = ink text with 2px left border and `aria-current`, others `ink-soft`. Then full-width `button-ink` "Contact Helping Group →", the ACNC chip in long form (link to `profileUrl`), and the `000` line pinned to the bottom (`mt-auto`, ink rule above, rust `000`). Script: also toggle `menu-open` on `<html>`; Escape/resize behaviour unchanged.

Also `StatusPanel.astro`: remove the `panel` variant, `compact` and `showCaseStudyAction` (only the old HH page used them). Homepage keeps `variant="inline"`.

## E2E and unit tests

Unit (new/extended): `tests/unit/nav.test.ts` (active state for each route, trailing slashes, archived projects → Projects not Helping Homes, 404/home → none), `format.test.ts` (`formatLongDateTime`), `status.test.ts` (`headline`, `regions`, `updatedLabel`, `officialLinks` ordering, both modes), `organisation.test.ts` (`charity`: ISO dates valid, `nextReportDue` after `lastReportedOn`, `nextReportDue` not in the past — deliberate yearly reminder, DGR false).

E2E (`tests/e2e/site.spec.ts`) — written red in Task 2:
- Current nav item: `/projects/helping-homes`, `/projects`, `/projects/our-move`, `/about`, `/archive` each have exactly one `[aria-current="page"]` in the Primary nav with the right label (desktop project only).
- Helping Homes: h1 "Ready for the next emergency", `helping-homes-status` mode/availability/"Last reviewed"/"call 000", `helping-homes-notice` matches `/replace 000/`, `season-steps` has 3 items, still exactly one visible "Contact Helping Group" link and no link to `helpinghomes.com.au`.
- Each archived slug: `archived-status` contains "Archived", `archived-notice` visible, `main img` count 0, Breadcrumb nav contains "Projects", "All projects" link visible.
- `/projects`: `archived-projects` has 3 rows, `main img` count 0, "Explore the service" links to `/projects/helping-homes`.
- `/archive`: `archive-articles` 4 rows, `archive-press` 5 items each with an image.
- `/about`: `#founder` visible, `dated-record` 4 items, `registration-record` contains ABN, "Small", `formatLongDate(lastReportedOn)`, `formatLongDate(nextReportDue)`, "not tax-deductible".
- 404: banner has the ACNC chip link (`.first()`), footer contains `ABN …`, `emergency-line` contains "000".
- Mobile: open menu → contains "ACNC registered charity" and "Call 000", every `data-mobile-nav-link` ≥ 48px tall, current page has `aria-current`; axe with the menu open.
- 320px (mobile project only): no sideways scroll on every public route and the 404 (after `document.fonts.ready`).
- Extend the axe loop to every `publicRoutes` entry plus the 404.
- **Change** the existing "charity verification" banner assertion to `.first()` (the open-menu panel adds a second chip link inside `<header>`).

## Tasks (subagent-driven; one commit each, reviewers after each batch)

- **Task 0** Branch `feature/inner-pages` from `docs/inner-pages-decisions`; copy this plan to `docs/plans/2026-09-29-inner-pages-implementation.md`; baseline `check`/`lint`/`test:unit`/`build`/`test:e2e` green; commit the plan.
- **Task 1** (TDD) `organisation.charity`, `lib/nav.ts`, `formatLongDateTime`, status presentation extensions, with their unit tests.
- **Task 2** Write the new e2e specs (red); update the `.first()` assertion.
- **Task 3** Shared components + CSS + `--color-rust-wash`; `Governance` uses `NoticeBlock` and `tone`; `StatusPanel` uses `StatusLine` and drops the panel variant; `SiteFooter` uses `navLinks`.
- **Task 4** Header: `isNavActive`, mobile menu panel.
- **Task 5** Helping Homes page + `[slug]` filter.
- **Task 6** Archived project template, delete `ProjectCard`, Projects page.
- **Task 7** About page.
- **Task 8** Archive page.
- **Task 9** 404 page.
- **Task 10** README (charity details: the report dates change every year and a unit test flags a stale `nextReportDue`; Helping Homes page copy and status file; where inner-page copy lives), Paper text sync for deviation 1, final full verification.

Batches: A = Tasks 0–2, B = 3–4, C = 5–6, D = 7–9, E = 10. Spec review then code-quality review after each batch; fixes by the same implementer.

## Critical files

Modify: `src/components/SiteHeader.astro`, `SiteFooter.astro`, `StatusPanel.astro`, `Governance.astro`, `src/layouts/BaseLayout.astro` (no change expected), `src/styles/global.css`, `src/lib/status.ts`, `src/lib/format.ts`, `src/data/organisation.ts`, `src/pages/about.astro`, `archive.astro`, `404.astro`, `projects/index.astro`, `projects/[slug].astro`, `tests/e2e/site.spec.ts`, `README.md`.
Create: `src/lib/nav.ts`, `src/components/{StatusLine,PageHero,SplitSection,NumberedRows,NoticeBlock,SourceList}.astro`, `src/pages/projects/helping-homes.astro`, `tests/unit/nav.test.ts`.
Delete: `src/components/ProjectCard.astro`.
Reuse: `getStatusPresentation` (`src/lib/status.ts`), `formatLongDate`, `organisation`, `verifiedPress`/`archiveArticles` (`src/data/archive.ts`), `Governance`, the content collection (`src/content.config.ts` unchanged).

## Verification

1. Per task: `bunx bun@1.4.2 run check && … run lint && … run test:unit && … run test:e2e && … run build`. Final: also `bun audit` (expected clean).
2. Visual: for each page, screenshot the built page (preview server) at 1440×900 full page and 390×844 and compare with the Paper artboard; also check 1024 and 768 for the hero and two-column sections (the homepage had 1024 breakage; use `lg`/`xl` breakpoints accordingly) and 320 for overflow.
3. Activated state (not covered by e2e because the build is static): temporarily set `helpingHomesStatus` to `mode: 'activated'` with the sample incident from `tests/unit/status.test.ts`, with `serviceAvailability` 'available' then 'unavailable', run `bun run dev`, screenshot `/projects/helping-homes` at both widths against `V3-0`, `17L-0`, `1KZ-0`, then revert (do not commit).
4. Mobile menu: open it at 390px on `/about` and compare with `P4-0`; tab through it; Escape returns focus to the toggle.
5. Push and open a PR only when the user asks; check the Vercel preview (first deploy of these pages).
