# Helping Group

The public website for Helping Group, the Australian not-for-profit behind
[Helping Homes](https://helping.group/projects/helping-homes).

The site is built with Astro and is fully static. Helping Homes' operational
state is kept in the repository so the public message can be changed and
deployed quickly during an emergency.

## Requirements

- [Bun 1.3.14](https://bun.sh/)

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

The small patch in `patches/` lets an optional Astro lint dependency use the
current, audited `brace-expansion` API. Remove it once that dependency updates
its own version range.

## Change the Helping Homes status

Edit `src/data/helping-homes-status.ts`.

- `mode: "standby"` is the normal state between emergency activations.
- `mode: "activated"` requires an incident name, affected regions and an
  official guidance URL.
- `serviceAvailability` is separate from the operational mode. Set it to
  `"unavailable"` if the Helping Homes application is not healthy; the group
  site will hide the outbound service action automatically.
- Update `lastUpdated` whenever the status changes.

Run all quality checks, review the Vercel preview, then promote the deployment.
Do not describe Helping Homes as an emergency service. People in immediate
danger must be directed to call 000 and follow official emergency advice.

## Edit project content

Project case studies live in `src/content/projects`. Their frontmatter is
validated by `src/content.config.ts`. Historical articles and verified press
links are curated in `src/data/archive.ts`.

Only publish claims that can be traced to a listed source. Archived projects
must not link to their former domains as active services.

## Deployment

Vercel builds the site with:

```bash
bunx bun@1.3.14 install --frozen-lockfile
bunx bun@1.3.14 run build
```

The explicit wrapper is needed because Vercel otherwise chooses the current
platform-managed Bun 1.x patch. The output directory is `dist`.
