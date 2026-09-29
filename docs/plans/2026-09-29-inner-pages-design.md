# Inner pages in the "Public notice" direction: design

**Status:** Approved 29 Sep 2026. The next step is designing in Paper. Implementation follows in a separate plan.

**Goal:** Design every page apart from the homepage in Direction B, "Public notice", before any of them are built. That covers each state visitors can reach, at desktop and mobile widths.

**Design source:** Paper file "Helping Group — Homepage refresh" (https://app.paper.design/file/01M3NFEQYESMWCAS7ZG3Z2BTRW). The homepage artboards "B · Public notice — Desktop" and "B · Public notice — Mobile" are the reference for every pattern here.

---

## Decisions

| Question | Decision |
|---|---|
| Scope | All six templates at desktop (1440) and mobile (390). |
| Helping Homes | Gets its own service page. It no longer shares the project template. |
| States | Helping Homes is designed standby and activated. |
| Mobile menu | Adds one open-menu artboard, because the homepage only shows the closed button. |
| Copy | Rewritten in the homepage voice, using only facts already in the repo or the verified facts. |
| Archived project images | Removed from the pages. The files remain as OG images. |
| Registration record | About shows charity size, tax status and reporting dates. That means adding these facts to `organisation.ts`. |
| 404 | Gets the site header and footer, so the ACNC chip is visible there too. |
| Working method | Approach A: build page by page, cloning the header and footer from the homepage. |

---

## Paper setup

- Add a new page, **"Inner pages — B · Public notice"**, to the same file. The existing tokens (`--color-notice-*`, `--color-evergreen`, `--color-leaf`, `--color-rust`, `--font-notice*`) carry over unchanged.
- Name artboards `B · <Page> — Desktop` and `B · <Page> — Mobile`. Desktop artboards are 1440 wide and mobile are 390, both at `fit-content` height.
- Clone the header and footer from the homepage artboards rather than rebuilding them. On each page, set the current nav item to the active style (ink text with a 2px ink underline).
- Lay the pages out in site order, left to right, with each mobile artboard directly beside its desktop artboard.
- Anything a page claims that isn't already in the repo goes in a note beside the artboard, never in the design itself, so the artboard always shows publishable copy.

### Artboards (15, plus one hero-only variant)

1. Helping Homes, standby: desktop and mobile
2. Helping Homes, activated: desktop and mobile, plus a desktop hero-only artboard showing the "app unavailable" fallback
3. About: desktop and mobile
4. Projects: desktop and mobile
5. Archived project: desktop and mobile. Our Move is the example.
6. Archive: desktop and mobile
7. 404: desktop and mobile
8. Mobile menu, open: mobile only

---

## Shared patterns

Build each of these once on the first page that needs it, then clone it everywhere else. Each one should become a single Astro component during implementation.

- **Inner-page hero.** An eyebrow in 13px Inter 600 capitals, an Inter Tight 700 headline one step below the homepage display size, and one lead paragraph in Inter 400 at 18/28. An optional breadcrumb or status line sits above the eyebrow. No imagery.
- **Status line.** A dot, then `HELPING HOMES · <STATE>`, then the summary, then "Last reviewed <date>". The dot is leaf when on standby, rust when activated, and `notice-soft` grey when archived.
- **Record table.** A ledger with a heavy top rule and hairline rows, drawn from homepage governance. It's used for the dated record, the registration record, the archived projects, the articles and the press. On mobile it stacks into label/value rows.
- **Numbered rows.** `01`, `02` and `03`, each with a title and a description, taken from the homepage "What Helping Homes connects".
- **Notice block.** The homepage "We never ask for donations" box: a white panel with a heavy top rule. There are three variants. *Standard* has an ink rule, *activated* has a rust rule, and *muted* (used on archived projects) has a `notice-line` rule and soft text.
- **Source list.** Links with a trailing ↗, drawn from the homepage "Check our responsible people" link style.

### Colour rules (from the homepage plan, restated)

- Leaf is never used as text on white. It appears only in the verification band and the status dots.
- Rust is reserved for the activated state, the `000` label and the focus ring.
- Grey (`notice-soft`) marks anything archived, so it never looks live.

---

## Pages

### Helping Homes, standby (`/projects/helping-homes`)

1. **Header**, with Helping Homes active.
2. **Status first.** Eyebrow `HELPING HOMES · ON STANDBY`. A headline along the lines of "Ready for the next emergency." The status summary comes from `getStatusPresentation`, followed by "Last reviewed" and the `000` line, all above the fold.
3. **What you can offer or find.** Numbered rows for Accommodation, Paddock space and Transport, with more detail than the homepage gives.
4. **How it works across a season.** A three-step record running Standby → Activated → Back to standby. It says what Helping Group publishes at each step: the affected region, the time of the latest update and links to official information. This is already stated in `helping-homes.md`.
5. **What it isn't.** A standard notice block, for example "Helping Homes doesn't replace 000 or official warnings."
6. **The record.** How it began in the Black Summer fires, with links to About and the sources.
7. **Footer.**

### Helping Homes, activated

This is the same page in the activated state:

- The status line has a rust dot. Eyebrow `HELPING HOMES · ACTIVATED`. A headline along the lines of "Responding to <incident>." The affected regions are listed, followed by "Last updated <time>".
- Links to official warnings sit **above** the "Open Helping Homes" button, never below it.
- The design includes the fallback for when the app is unavailable: an activated notice block that points to official emergency information instead of the button.
- The example incident is labelled as a sample in the note beside the artboard.

### About (`/about`)

1. **Hero.** Eyebrow `ABOUT · SINCE 2020`. A headline along the lines of "Started in a crisis. Kept small on purpose."
2. **How it began** (keeps the `#founder` anchor, which the homepage links to). The Black Summer story, with Daniel's founder note folded into it.
3. **A dated record.** Summer 2019–20: Helping Homes built. 6 Aug 2020: registered with the ACNC. 2020–21: other ideas explored, now archived. Today: Helping Homes on standby.
4. **How we work.** Three numbered rows: start with the practical problem, say what's true about status, stay inside official boundaries.
5. **Who's accountable.** `<Governance />`, followed by a registration record: ABN 34 726 868 010, registered 6 Aug 2020, Small charity, income tax exempt, not DGR, last reported 23 Feb 2026, next report due 31 Jan 2027.
6. **Footer.**

### Projects (`/projects`)

1. **Hero.** A headline along the lines of "One service we keep ready. Three ideas we've archived."
2. **Continuing.** Helping Homes as one large row, not a card. It uses the inline status variant and links to its page.
3. **Archived.** A record table with the project, what it explored, a grey `ARCHIVED` status and a case study link. No images.
4. **Footer.**

### Archived project (`/projects/[slug]`)

1. **Hero.** A `Projects / <Title>` breadcrumb, then a grey status line reading `ARCHIVED · NOT OPERATING` with the period. Then the title and the summary.
2. **Muted notice block**, taken from the `outcome` field.
3. **The record.** Numbered rows for 01 The challenge, 02 The response and 03 Where it stands.
4. **Case study.** Markdown prose in a reading column of about 680px.
5. **Sources**, followed by a link back to all projects.
6. **Footer.**

### Archive (`/archive`)

1. **Hero.** A headline along the lines of "The record, as it was written." It says the items are kept as historical sources, not rewritten.
2. **In our own words.** A record table of the four Medium articles, newest first, showing the date, category and title ↗.
3. **Reported at the time.** Press rows with the homepage logo sizing, the outlet, a description and "Read ↗". A note says coverage doesn't imply a current partnership.
4. **Footer.**

### 404

The page has the header and footer. Between them sit an "Error 404" eyebrow, the headline "This page isn't here.", a lead line, and two buttons (Home and Helping Homes). The `000` line appears below them.

### Mobile menu, open

A full-height ink or white panel below the header. It lists the nav items at a generous tap size (at least 48px), then Contact, the ACNC chip in its long form, and the `000` line at the bottom.

---

## Mobile rules

- Record tables stack into label/value rows, following the homepage mobile governance table.
- Ledgers stack the date above the title.
- Numbered rows put the number and title on one line and the description below.
- Buttons are full width and stacked, following the homepage mobile hero.
- The page never scrolls sideways at 320px. Check this again during implementation.

---

## Copy rules

- Write in the first person plural with short sentences and no marketing superlatives, matching "Who's accountable" and "We never ask for donations".
- Use only facts from `src/content/projects/*.md`, `src/data/*.ts`, the verified facts in `2026-09-29-public-notice-redesign.md`, or the ACNC register.
- Any claim that doesn't come from those sources goes in the note beside the artboard for confirmation.

---

## Open questions (for the user, not blocking)

1. How activation is decided, and who decides. Leave it out of the page until it's confirmed.
2. Whether the Helping Homes app shows its map while on standby.
3. The email mismatch between the ACNC register and the site. This is carried over from the homepage plan.

---

## Implementation implications (for the later plan)

- Add `charitySize`, `incomeTaxExempt`, `dgr`, `lastReportedOn` and `nextReportDue` to `src/data/organisation.ts`. The report dates change every year, so the README note from Task 13 should mention them.
- Split `/projects/helping-homes` out of `[slug].astro` into its own page, with the other three slugs still generated from `[slug].astro`.
- Give the status line an archived variant, and give the notice block its standard, activated and muted variants.
- Add the header and footer to `404.astro`.
- Restyle the existing mobile menu dropdown (`data-mobile-menu` in `SiteHeader.astro`) to match the open-menu artboard.
- This supersedes Task 12 of the homepage plan, which only added `<Governance />` to the old About page.

## Out of scope

- Any change to the homepage. The homepage in the activated state is a follow-up.
- The social card refresh.
- Writing code.
