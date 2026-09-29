# Inner pages in Paper: execution plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This plan is design work in Paper, not code. Review checkpoints stand in for tests, and a user review stop stands in for each commit.

**Goal:** Design every page apart from the homepage in the "Public notice" direction, as specified in `docs/plans/2026-09-29-inner-pages-design.md`.

**Architecture:** Add one new page to the existing Paper file. Build the pages in site order, desktop then mobile. Clone the header, footer, status bar and governance section from the homepage artboards, then write each section with `write_html` using the file's existing tokens. Each page ends in a review stop with the user.

**Tech stack:** Paper MCP (`mcp__Paper__*`) and the file's existing tokens. The fonts are Inter and Inter Tight.

**Design spec:** `docs/plans/2026-09-29-inner-pages-design.md`. Read it before starting.

---

## Conventions

- **File ID:** `01M3NFEQYESMWCAS7ZG3Z2BTRW`. Pass it on every Paper call; the tools reject calls without it.
- **Node IDs:** Look them up at runtime with `get_tree_summary` or `find_nodes` by layer name. Never write node IDs into anything the user reads.
- **Homepage source artboards:** "B · Public notice — Desktop" and "B · Public notice — Mobile", on the page "Homepage — two directions".
- **Write small:** Each `write_html` call adds one visual group (a heading block, one table row, one button pair). Name every frame with `layer-name`.
- **No margins, grids or tables in HTML.** Use flex, padding and gap, as `write_html` requires.
- **Finish:** Call `finish_working_on_nodes` with the artboard IDs at the end of every task.
- **Contact email:** Use `contact@helpinggroup.com.au`, the address on the ACNC register, which `organisation.ts` uses as of commit `0b91a94`. The homepage artboards still say `contact@helping.group`. After cloning the Footer or Governance, run `find_nodes({ textValue: "*helping.group*" })` on the new artboard and fix each match with `set_text_content`.

### Type and layout values (taken from the homepage)

| Role | Desktop | Mobile |
|---|---|---|
| Eyebrow | `var(--font-notice)` 13px/16px, 600, `0.08em`, uppercase, `var(--color-evergreen)` | 12px/16px, same otherwise |
| Page title (new) | `var(--font-notice-display)` 80px/80px, 700, `-0.045em`, `var(--color-notice-ink)`, max width 1080px | 42px/44px, `-0.04em` |
| Section title | Inter Tight 48px/52px, 700, `-0.035em` | Match homepage mobile "Who's accountable." (read it with `get_computed_styles`) |
| Notice title | Inter Tight 30px/34px, 700, `-0.03em` | Match homepage mobile notice |
| Lead | Inter 18px/29px, `var(--color-notice-soft)`, width 620px | 17px/27px |
| Body | Inter 16px/25px, `var(--color-notice-soft)` | 15px/23px |
| Table header | Inter 12px/16px, 600, `0.08em`, uppercase, soft, with a 2px `var(--color-notice-ink)` bottom border and 12px bottom padding | Omitted: rows stack |
| Table row | 20px block padding, 1px `#CDD6CA` bottom border on snowgum or `var(--color-notice-line)` on white. Primary cell is Inter 18px/24px 600 ink; secondary cell is Inter 16px/24px soft | Label on top, value below, 16px block padding |
| Link | Inter 15–16px, 600, `var(--color-evergreen)`, `text-decoration: underline 1px`, `text-underline-offset: 5px`, with a trailing ↗ (external) or → (internal) | Same |
| Primary button | `var(--color-evergreen)` background, radius 6px, padding 16px 20px, white 16px/20px 600 label, `var(--color-leaf)` arrow | Full width |
| Secondary button | 1px `var(--color-notice-line)` border, radius 6px, ink label, soft arrow | Full width |
| Section frame | Width 100%, padding 104px block and 80px inline, inner frame 1280px wide | Padding 56px block and 20px inline, content 350px |
| Hero frame | Padding 88px top, 72px bottom, 80px inline, 1px `var(--color-notice-line)` bottom border. Title has 28px top padding; lead row has 56px top padding | Padding 40px top, 36px bottom, 20px inline |

Section backgrounds alternate between `#FFFFFF` and `var(--color-snowgum)`. Each page lists its own order.

### Canvas positions

Every artboard sits at `top: 0`. Page slot `k` puts the desktop artboard at `left = k × 2600`, the mobile artboard at `left = k × 2600 + 1520`, and the note at `left = k × 2600 + 1990`.

| k | Page |
|---|---|
| 0 | Helping Homes, standby |
| 1 | Helping Homes, activated (the hero-only "app unavailable" artboard goes directly below the desktop artboard, 160px gap) |
| 2 | About |
| 3 | Projects |
| 4 | Archived project |
| 5 | Archive |
| 6 | 404 |
| 7 | Mobile menu (mobile at `k × 2600`, note at `k × 2600 + 470`) |

---

## Shared procedures

Tasks refer to these by name.

### P1: New desktop artboard

1. `create_artboard` with `pageId` set to the new page, `name: "B · <Page> — Desktop"` and `styles: { width: "1440px", height: "900px", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column" }`.
2. `update_styles` sets `left` and `top` from the canvas positions table.
3. **Header:** `duplicate_nodes` the homepage desktop "Header" frame with `parentId` set to the new artboard. If cross-page duplication fails, duplicate it in place and then `move_nodes` it (`parentId: <artboard>, index: 0`).
4. **Nav state:** Set the page's own nav item to ink, 600, with a 2px `var(--color-notice-ink)` bottom border and 4px bottom padding. Set every other item to `var(--color-notice-soft)`, 500, with no border. (On the homepage "Helping Homes" is ink 600, so reset it too.) On the 404 page, no item is active.

### P2: New mobile artboard

1. `create_artboard` with `name: "B · <Page> — Mobile"` and `styles: { width: "390px", height: "844px", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column" }`, then position it.
2. Duplicate the homepage mobile "Status bar" and "Header" into it, in that order.

### P3: Footer and fit

1. Duplicate the homepage "Footer" (desktop or mobile, to match) as the last child.
2. `update_styles` sets the artboard to `height: "fit-content"`.

### P4: Section review (after every section)

1. `get_screenshot` of the section (use scale 2 for small text).
2. Write a one-line verdict covering spacing, typography, contrast, alignment, artboard fit and repetition.
3. Fix any issue with targeted `update_styles` or `set_text_content`. Never delete and rebuild a whole section.
4. Check the colour rules: no leaf text on white, rust only for activated, `000` and focus, and grey for anything archived.

### P5: Note artboard

1. `create_artboard` with `name: "Note · <Page>"`, `styles: { width: "360px", height: "400px", backgroundColor: "#FFF6CC", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }`, then position it.
2. Write two blocks in Inter 14px/21px `#3A3000`: **"To confirm"** (the listed items) and **"Copy sources"** (the files each line of copy came from). Then set `height: "fit-content"`.

### P6: Page review stop

1. `get_screenshot` of the whole desktop and mobile artboards.
2. `finish_working_on_nodes` with those artboard IDs.
3. **Stop.** Give the user a short summary and the to-confirm list, and wait for approval or changes before starting the next task.

---

### Task 0: Setup

**Step 1:** Run `get_guide({ topic: "paper-mcp-instructions" })` if it isn't already in context.

**Step 2:** Run `get_font_family_info({ familyNames: ["Inter", "Inter Tight"] })`. Expected: both available, with weights 400, 500, 600 and 700.

**Step 3:** Run `create_page({ fileId, name: "Inner pages — B · Public notice" })`. Keep the returned `pageId` for every later `create_artboard`.

**Step 4:** Use `get_tree_summary` (depth 4) on both homepage B artboards and record the IDs of: Header, Status bar, Footer, Governance, the "Evidence" press logo row, the status block in the hero, and the "Public notice" block. Use `get_computed_styles` on the mobile "Who's accountable." heading and the mobile notice title, and fill in the two "match homepage" cells above.

**Step 5 (spike):** Try P1 step 3 on a throwaway artboard to confirm which cloning method works, then delete that artboard.
Expected: the Header appears inside the new artboard at full width.

---

### Task 1: Helping Homes, standby, desktop (slot 0)

**Step 1:** P1 for page "Helping Homes · Standby", with Helping Homes active in the nav.

**Step 2, Hero (white):** A layer named "Hero".
- Eyebrow row: a 10px leaf dot with a 2px `#D8EBC2` ring, then `HELPING HOMES · ON STANDBY` in ink. This row replaces the plain eyebrow.
- Page title: **Ready for the next emergency.**
- Lead row, left column (620px): *Helping Homes connects people affected by bushfires, floods and other emergencies with a spare room, paddock space or transport offered by their community. Between emergencies, it rests on standby.*
- Right column: 1px `var(--color-notice-line)` left border and 40px left padding. It holds:
  - *Not activated right now. The app is temporarily offline between emergencies.* (16px/25px soft)
  - *Last reviewed 27 July 2026* (14px soft)
  - `000` (rust Inter Tight 700) *In immediate danger? Call 000 first.*
  - Link: *Australian emergency information ↗*
- There's no "Open Helping Homes" button in standby, because `showServiceAction` is false while the app is unavailable.

P4.

**Step 3, What you can offer or find (snowgum):** Two columns, like the homepage "Connects" section.
- Left (420px): eyebrow `What you can offer or find`, section title **Three kinds of help, one map.**, then the body *People offer what they have. People affected by an emergency search an Australia-wide map for support that fits.*
- Right: numbered rows, each with a 2px ink top rule on the first row and hairlines between. Each row has a number slot (48px, `flexShrink: 0`, Inter 600 evergreen), a title slot (280px, Inter Tight 24px/30px 700 `-0.02em`) and a description:
  - `01` **Accommodation**: *A spare room, a home or a safe place to stay while you can't be at home.*
  - `02` **Paddock space**: *Temporary space for livestock, horses and other animals.*
  - `03` **Transport**: *Help moving people, animals or essential belongings.*

P4, including a check that the number, title and description lanes align across all three rows.

**Step 4, How a season works (white):**
- Eyebrow `How it works`, section title **How a season works.**
- Three columns separated by 1px lines. Each column has a 6px top rule, which is leaf on the current step and `var(--color-notice-line)` on the others. Under the rule, a small caps label reads `NOW` on the current step only.
  - `01` **Standby**: *Between emergencies. The app may be offline, and this page says so, with the date we last checked.*
  - `02` **Activated**: *When an emergency needs it, we publish the affected region, the time of the latest update and links to official emergency information.*
  - `03` **Back to standby**: *When the need passes, we say so here and return to standby.*

P4.

**Step 5, Public notice (snowgum):** Clone the homepage "Public notice" block into a 1280px frame and set its width to 620px. Change the copy:
- Eyebrow `Public notice`
- Title **Helping Homes doesn't replace 000.**
- Body *If you're in immediate danger, call 000 and follow advice from your emergency service. Helping Homes is for practical offers once those safety decisions are made.*
- Link *Australian emergency information ↗*

The block stands alone and is left-aligned. Leave the rest of the row empty; the white space is deliberate.

P4.

**Step 6, Built during Black Summer (white):**
- Eyebrow `How it began · Summer 2019–20`, section title **Built during Black Summer.**
- Body (620px): *Daniel Ferguson started Helping Homes during the 2019–20 bushfires, when offers of a spare room were scattered across social media and hard to find at the moment they were needed.*
- Links: *How we began →* (to `/about#founder`) and *Helping Homes: Catch me up ↗*

P4.

**Step 7:** P3.

**Step 8:** P5 with these to-confirm items: how activation is decided and by whom (left off the page), and whether the app shows its map while on standby. Copy sources: `helping-homes.md`, `helping-homes-status.ts`, `status.ts`.

---

### Task 2: Helping Homes, standby, mobile (slot 0)

**Step 1:** P2.

**Step 2:** Hero. Stack everything: the eyebrow row, then the title at 42px, then the lead, then a 2px ink top rule over the status block (matching the homepage mobile hero), then the `000` line, then the link.

**Step 3:** The offer section. Each numbered row puts the number and title on one line and the description below.

**Step 4:** Season steps. Stack the three columns into rows, each with a 4px left rule in place of the top rule. `NOW` stays on the first step.

**Step 5:** The notice block at full width, then the Black Summer section.

**Step 6:** P3, then P4 across the whole artboard. Check that nothing overflows 350px.

**Step 7:** P6. **Stop for the user's review of Helping Homes, standby.**

---

### Task 3: Helping Homes, activated, desktop and mobile (slot 1)

**Step 1:** `duplicate_nodes` the Task 1 and Task 2 artboards, rename them "B · Helping Homes · Activated — Desktop" and "— Mobile", and position them.

**Step 2, Hero changes (desktop):**
- Eyebrow row: a rust dot with a `color-mix(in srgb, var(--color-rust) 25%, transparent)` ring, then `HELPING HOMES · ACTIVATED`.
- Title: **Responding to bushfires in western Victoria.** *(sample)*
- Lead: *Helping Homes is active for the regions below. Check official warnings first, then use Helping Homes to find or offer a place to stay, paddock space or transport.*
- Right column, in this order:
  1. The 6px rust top rule on the column.
  2. *Activated for Grampians, Wimmera and Southern Grampians.* *(sample)*
  3. *Last updated 14 January 2027, 6:40 am AEDT* *(sample)*
  4. Caps label `CHECK OFFICIAL WARNINGS FIRST`, with the links *VicEmergency ↗* and *Australian emergency information ↗*
  5. Primary button **Open Helping Homes** →
  6. The `000` line

**Step 3:** In the season steps, move the leaf rule and `NOW` label from step 01 to step 02, and make that rule rust.

**Step 4:** In the public notice block, make the top rule rust. The copy stays the same.

**Step 5:** Apply the same changes to the mobile artboard. The button is full width, and the warnings list sits above it.

**Step 6, App unavailable (desktop, hero only):** `duplicate_nodes` the activated desktop artboard, rename it "B · Helping Homes · Activated, app unavailable — Hero", delete every section after the Hero, and position it below the activated desktop artboard. In place of the primary button, add an activated notice block (a 6px rust top rule, a white panel, 24px padding):
- Title **The app is temporarily unavailable.**
- Body *Use official emergency information, or contact us at contact@helpinggroup.com.au.*

This is based on `availabilityNote` in `status.ts`.

**Step 7:** P4 on each changed section. P5 with the note "Incident, regions and time are samples", the question of whether VicEmergency is the right source for a given state, and a question about the dot ring colour.

**Step 8:** P6. **Stop for the user's review of the activated state.**

---

### Task 4: About, desktop (slot 2)

**Step 1:** P1, with About active.

**Step 2, Hero (white):** Eyebrow `About · Since 2020`, title **Started in a crisis. Kept small on purpose.**, lead *Helping Group is a small Australian charity. We began during the 2019–20 bushfires with one practical question, and Helping Homes is still the work we do.* No right column.

**Step 3, How it began (snowgum, layer name "Founder"):** Two columns.
- Left (420px): eyebrow `How it began`, section title **One question, asked during Black Summer.**, and a 44px leaf logo mark (clone the SVG from the header logo and scale it).
- Right (620px): *In the summer of 2019–20, thousands of people were deciding where they could go and what they could take with them. People wanted to help, but offers of a spare room were scattered across social media and hard to find when they were needed.* Then: *Daniel Ferguson asked whether a simple digital service could connect people evacuating with people who had room. That became Helping Homes, and Helping Group formed around it.* Then the signature *Daniel Ferguson · President and founder* (Inter 600 ink 15px).

P4.

**Step 4, The record so far (white):** Section title **The record so far.** A record table with a Date column (220px, `flexShrink: 0`) and an Event column:
- **Summer 2019–20**: *Helping Homes built during the Black Summer bushfires.*
- **6 August 2020**: *Registered with the Australian Charities and Not-for-profits Commission.*
- **2020–21**: *Other ideas explored: Rainbow Restoration, Our Move and What's My Impact?. All are now archived.*
- **Today**: *Helping Homes on standby, last reviewed 27 July 2026.*

P4.

**Step 5, How we work (snowgum):** Section title **How we work.** Numbered rows, with the same lanes as Task 1 step 3:
- `01` **Start with the practical problem**: *We build something only when it makes a hard moment clearer or helps someone take a useful next step.*
- `02` **Say what's true about status**: *Helping Homes tells you when it's on standby, when it's activated and when the app is offline. We don't invent urgency between emergencies.*
- `03` **Stay inside official boundaries**: *We connect community offers. We don't replace 000, emergency warnings or professional services.*

P4.

**Step 6, Governance (white):** Duplicate the homepage "Governance" section (it's on snowgum there) and set its background to white.

**Step 7, Registration record (white, directly below):** Eyebrow `Registration record`, then a record table with a Field column (320px) and a Value column:
- **ABN**: *34 726 868 010*, with the link *ABN Lookup ↗*
- **Registered with the ACNC**: *6 August 2020*
- **Charity size**: *Small*
- **Tax status**: *Income tax exempt*
- **Deductible gift recipient**: *No. Gifts to Helping Group aren't tax-deductible, and we don't ask for them.*
- **Last annual report**: *23 February 2026*
- **Next report due**: *31 January 2027*

Then the link *Our full entry on the ACNC Charity Register ↗*.

P4.

**Step 8:** P3. P5 with these to-confirm items: the years for the archived ideas (2020–21), and the sentence about deductible gifts.

---

### Task 5: About, mobile (slot 2)

**Step 1:** P2.

**Step 2:** Build the sections in the Task 4 order. The Founder section stacks the title, then the leaf mark, then the body. The record table stacks the date (caps label) over the event. The registration record stacks field over value.

**Step 3:** P3, then P4 across the whole artboard.

**Step 4:** P6. **Stop for the user's review of About.**

---

### Task 6: Projects, desktop and mobile (slot 3)

**Step 1:** P1, with Projects active.

**Step 2, Hero (white):** Eyebrow `Projects`, title **One service we keep ready. Three ideas we've archived.**, lead *Helping Homes is our continuing work. The other ideas are kept here as a record and clearly marked, so nobody mistakes them for live services.*

**Step 3, Continuing work (white, no top padding):** A 2px ink top rule, then one row with:
- Left: eyebrow `Continuing work`, the title **Helping Homes** in Inter Tight 48px, and the summary *A seasonal service connecting people affected by natural disasters with offers of emergency accommodation, paddock space and transport.*
- Right (400px, left border): the inline status (a leaf dot, `ON STANDBY`, *Not activated right now. The app is temporarily offline between emergencies.*, *Last reviewed 27 July 2026*) and the secondary button **About Helping Homes →**.

**Step 4, Archived (snowgum):** Eyebrow `Archived`, section title **Earlier ideas.** A record table with Project (320px), What it explored (flex), Status (140px) and a link slot (140px):
- **Rainbow Restoration**: *A trading-card series sharing the stories of LGBTQIA+ people from history.* A grey dot and `ARCHIVED`, then *Case study →*
- **Our Move**: *A platform for helping communities prepare together before bushfire season.* Status and link as above.
- **What's My Impact?**: *Making the social and environmental effects of investments easier to understand.* Status and link as above.

Order follows the `order` frontmatter. The grey dot is `var(--color-notice-soft)` with no ring. P4, including a check that the status and link lanes align.

**Step 5:** P3. Then P2 and build the mobile artboard. The continuing row stacks and its button goes full width. Each archived row stacks: title, then description, then `ARCHIVED` and the link on one line.

**Step 6:** P5 (nothing to confirm; the copy comes from `src/content/projects/*.md`). Then P6. **Stop for the user's review of Projects.**

---

### Task 7: Archived project, desktop and mobile (slot 4, Our Move)

**Step 1:** P1, with Projects active.

**Step 2, Hero (white):**
- Breadcrumb *Projects / Our Move* (14px, with "Projects" as a soft underlined link).
- Status row: a grey dot and `ARCHIVED · NOT OPERATING`.
- Title **Our Move**.
- Lead *An archived platform concept for helping communities prepare together before bushfire seasons.*

**Step 3, Notice (white):** A muted notice block, 620px wide: a 6px `var(--color-notice-line)` top rule on a `var(--color-snowgum)` panel. Caps `Archived`, title **This project is archived.**, and the body from `outcome`: *The platform is no longer operating and the original domain has been retired. The project is preserved as an archived part of Helping Group's history.*

**Step 4, The record (snowgum):** Numbered rows, as in Task 1 step 3, for 01 **The challenge**, 02 **The response** and 03 **Where it stands**, with the copy taken verbatim from `our-move.md`.

**Step 5, Case study (white):** Eyebrow `Case study`. A 680px reading column with the heading **Preparing before the emergency** (Inter Tight 30px) and the two paragraphs from `our-move.md` in Inter 17px/28px soft.

**Step 6, Sources (white, no top padding):** A 2px ink rule, eyebrow `Sources`, the link *Original Helping Group project listing ↗*, then the secondary button **← All projects**.

**Step 7:** P3. P2, then build the mobile artboard with everything stacked. P4 across both.

**Step 8:** P5 with this to-confirm item: whether the source link (`helping.group/#initiatives`) still resolves after the rebuild. Then P6. **Stop for the user's review.**

---

### Task 8: Archive, desktop and mobile (slot 5)

**Step 1:** P1, with Archive active.

**Step 2, Hero (white):** Eyebrow `Archive`, title **The record, as it was written.**, lead *Our early articles and the reporting from the time, kept as historical sources. We haven't rewritten them.*

**Step 3, In our own words (white):** Section title **In our own words.** A ledger with a Date column (180px), a Category column (180px, caps soft) and a Title and description column. Newest first:
- *23 Oct 2021* · Organisation · **Helping Group: Who are we? ↗**, with its description from `archive.ts`
- *23 Oct 2021* · Helping Homes · **Helping Homes: Catch me up ↗**
- *22 Dec 2020* · Organisation · **Helping Group: Catch me up ↗**
- *12 Dec 2020* · Year in review · **Let's recap on 2020 ↗**

P4.

**Step 4, Reported at the time (snowgum):** Section title **Reported at the time.**, then the body *We rechecked these links before listing them. Coverage is a historical record, not a current partnership.* Then rows with a Logo column (200px, cloned from the homepage Evidence row at the same display heights), an Outlet column (240px, Inter 600 ink), a Description column (flex) and a *Read ↗* column (100px):
- The Courier: *Emergency accommodation for families affected by fire*
- 9Now: *Ways Australians could offer accommodation during the fires*
- Australian Financial Review: *Holiday homes and emergency accommodation for evacuees*
- Stock & Land: *Practical assistance for people affected by fire*
- Student Edge: *Where to find emergency accommodation during bushfires*

P4, including a check that the logos look optically even and the lanes align.

**Step 5:** P3. P2, then build the mobile artboard: ledger rows stack the date and category over the title, and press rows stack the logo, then the outlet and description, then Read.

**Step 6:** P5 (nothing to confirm). P6. **Stop for the user's review.**

---

### Task 9: 404, desktop and mobile (slot 6)

**Step 1:** P1, with no nav item active.

**Step 2, Body (white, 160px block padding):**
- Eyebrow `Error 404`
- Title **This page isn't here.**
- Lead *The link may be old, or the page may have moved into the project archive.*
- Buttons: primary **Go to the homepage →** and secondary **Helping Homes →**
- The `000` line

Everything is left-aligned in the 1280px container, not centred. That's consistent with every other page.

**Step 3:** P3. P2, then build the mobile artboard.

**Step 4:** P4. P6. **Stop for the user's review.**

---

### Task 10: Mobile menu, open (slot 7)

**Step 1:** P2 with `name: "B · Mobile menu — Open"`. In the cloned header, swap the menu icon for a close icon (an 18px SVG ✕ drawn with two 2px white strokes).

**Step 2, Panel (white, full height of an 844px artboard, 20px inline padding):**
- Nav rows: Helping Homes, Projects, About and Archive. Each row is 56px high with a 1px `var(--color-notice-line)` bottom border, Inter 20px 600 ink, and a soft → in a 24px trailing slot.
- A full-width ink **Contact** button (radius 6px, 52px high).
- The long-form ACNC chip: *ACNC registered charity ↗*
- The `000` line, pinned to the bottom with 32px bottom padding.

Keep this artboard at a fixed 844px height; don't switch it to `fit-content`.

**Step 3:** P4. P5 with this to-confirm item: whether the menu should cover the full screen or drop down as it does today. P6. **Stop for the user's review.**

---

### Task 11: Wrap up

**Step 1:** `get_basic_info` on the new page. Expected: 16 design artboards (15 plus the "app unavailable" hero) and 8 notes.

**Step 2:** Collect every to-confirm item from the notes into the "Open questions" section of `docs/plans/2026-09-29-inner-pages-design.md`, along with any changes the user asked for during reviews.

**Step 3:** Commit.

```bash
git add docs/plans/2026-09-29-inner-pages-design.md
git commit -m "docs: record inner page review outcomes"
```

**Step 4:** Hand off. The next step is an implementation plan (superpowers:writing-plans) that builds these pages in Astro from the Paper artboards. It uses `get_jsx` and `get_computed_styles`, never screenshots.
