# Helping Group

The public website for Helping Group, the Australian not-for-profit behind
[Helping Homes](https://helping.group/projects/helping-homes).

The site is built with Astro and is fully static. Helping Homes' operational
state is kept in the repository so the public message can be changed and
deployed quickly during an emergency.

## Requirements

- [Bun 1.4.2](https://bun.sh/)

## Local development

```bash
bun install
bun run dev
```

Astro serves the site at `http://localhost:4321`.

## Quality checks

```bash
bun run check
bun run lint
bun run test:unit
bun run test:e2e
bun run build
bun outdated
bun audit
```

`test:e2e` builds the site and tests the production preview at desktop and
mobile viewport sizes.

`overrides` in `package.json` pin a few transitive dependencies to versions
that fix published advisories. Re-run `bun audit` after each upgrade and remove
an override once its parent package no longer needs it.

TypeScript stays on 6.x for now because `astro check` does not yet support
TypeScript 7.

## Change the Helping Homes status

Edit `src/data/helping-homes-status.ts`.

- `mode: "standby"` is the normal state between emergency activations.
- `mode: "activated"` requires an incident name, affected regions and an
  official guidance URL.
- `serviceAvailability` is separate from the operational mode. Set it to
  `"unavailable"` if the Helping Homes application is not healthy; the group
  site will hide the outbound service action automatically.
- Update `lastUpdated` whenever the status changes.

The Helping Homes page (`src/pages/projects/helping-homes.astro`) and the
homepage status read this file, so the page headline, affected regions, official
links and the "You are here" step change with it. The standby copy, the
offer descriptions and the season steps are written in that page; the title,
summary and source come from `src/content/projects/helping-homes.md`.

Run all quality checks, review the Vercel preview, then promote the deployment.
Do not describe Helping Homes as an emergency service. People in immediate
danger must be directed to call 000 and follow official emergency advice.

## Edit project content

Archived project pages are generated from `src/content/projects` (Helping
Homes has its own page and only uses its metadata from there). Their frontmatter
is validated by `src/content.config.ts`; `hero` is used only for the social
card image, since the pages themselves carry no imagery. Historical articles and
verified press links are curated in `src/data/archive.ts`.

Only publish claims that can be traced to a listed source. Archived projects
must not link to their former domains as active services.

## Edit charity details

Helping Group's verifiable facts live in `src/data/organisation.ts`: ABN, ACNC
registration, responsible people, Acknowledgement of Country and early
supporters. Every value must match the
[ACNC Charity Register](https://www.acnc.gov.au/charity/charities/e19a1344-f4b1-eb11-8236-000d3a6ab783/profile)
or the Australian Business Register.

- When the board changes on the ACNC register, update `responsiblePeople`.
- After each Annual Information Statement, update `charity.lastReportedOn` and
  `charity.nextReportDue` (shown on the About page). A unit test fails once
  `nextReportDue` has passed, as a reminder.
- The build fails if the ABN does not pass the ABR checksum.
- The site never asks for donations. Keep the public notice accurate if that
  ever changes.

## Deployment

Vercel builds the site with:

```bash
bunx bun@1.4.2 install --frozen-lockfile
bunx bun@1.4.2 run build
```

The explicit wrapper is needed because Vercel otherwise chooses the current
platform-managed Bun 1.x patch. The output directory is `dist`.
