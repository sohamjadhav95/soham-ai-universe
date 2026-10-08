# Content model

All text, links and media paths live in `src/data/`. Pages read these files directly; there is no CMS.
For step-by-step owner tasks (add an image, a link, a video), see the root `README.md`.
This page is the field reference: what each field does and where it shows up.

## `site.ts`

`SITE` holds the single source of truth for who and where. Footer, menu, contact page and header all read it.

| Field | Used for |
|---|---|
| `name`, `firstName`, `lastName` | Titles, header logo, alt texts |
| `roleTop`, `roleMain` | Home hero role ("AI / ML" / "Engineer & Researcher"), header logo roll |
| `mission` | Tagline |
| `location` (`badge`, `city`, `timeZone`, `tzLabel`) | Home "Located in India" badge, About intro, footer local time |
| `email`, `phone`, `phoneHref`, `resume` | Footer, contact page, About résumé button |
| `version` | Footer bottom strip ("2026 © Edition") |
| `web3formsKey` | Contact form; public by design |
| `socials` (`{ label, href }[]`) | Footer social dock (icons chosen by `label`), menu, contact page. GitHub must stay first: Work's "All code on GitHub" uses `socials[0]`. |
| `photos` (`hero`, `avatar`, `about`) | Home hero cut-out, round avatar (footer, contact), About photo |

`NAV` holds the menu links. `GREETINGS` holds the words the preloader flashes (last: Marathi नमस्कार).

## `about.ts`

| Export | Shape | Shown on About as |
|---|---|---|
| `SERVICES` | `{ nr, title, text }[]` | "What I can do for you" grid |
| `PAPERS` | `{ title, venue, type, date, authors, doi, href }[]` | "Published research" rows (open `href` in a new tab) |
| `EXPERIENCE` | `{ role, org, period, text }[]` | "Experience" rows |
| `CERTIFICATES` | `{ title, issuer, date, image, href }[]` | "Certificates" rows with a hover preview of `image` (desktop) |

## `projects.ts`

`PROJECTS` is the list of projects. **Its order is the order on the Work page**, and "Next case" follows it, wrapping around.
Helpers: `getProject(slug)` and `nextProject(slug)`.

### `Project`

| Field | Rendered where |
|---|---|
| `slug` | URL `/work/<slug>`; keys for art, buddy notes and "seen" tracking |
| `title` | Lists, page title, curtain label, next-case title |
| `org` | Work list "Context" column |
| `services` | Work list "Field" column, card meta, Home rows |
| `year` | Work list, card meta, project "Context & year" |
| `categories` (`'research' \| 'engineering'`)[] | Work filters; a project can be in both |
| `featured` | Shown in Home "Recent work" |
| `tone` (`bg`, `ink`, `accent`) | Illustration and cover background colours, gallery figure colours |
| `cover` | Image used instead of the drawn illustration (lists, hover previews, project hero, next-case thumb) |
| `summary` | Line under the project title; buddy intro fallback |
| `intro` (`role`, `stack`, `context`) | The three columns under the title |
| `links` (`{ label, href }[]`) | **The first link** is the big round blue button on the hero; all links appear as pills lower down. Empty, and there's no button. |
| `video` / `videos` | One or more `VideoPlayer` blocks after the hero (`videos` wins). See below. |
| `iframe` (`{ src, bg?, cover? }`) | A live page or PDF on a CSS desktop monitor, in a full-width grey band (`DeviceIframe`, `Monitor`). PDFs get `#toolbar=0&navpanes=0&view=FitH` added so Chrome and Edge hide the viewer toolbar. `cover` (`{ venue, title, authors, href }`) is what **phones** show instead, a page-1-style cover with *Read the paper*, because phones can't show a PDF inside a page. |
| `highlights` (`{ value, label }[]`) | Big numbers row (`.case-highlights`) |
| `sections` (`{ heading, body: string[] }[]`) | Text sections, one paragraph per `body` string |
| `flow` (`{ title, steps: { label, detail }[] }`) | Numbered "how it works" steps; more than 5 steps wraps to 4 columns |
| `sample` (`{ title, code }`) | A code or command block |
| `gallery` (`{ src, alt, caption }[]`) | Figures with captions |
| `note` | Small note under the links |

### `ProjectVisual` and `ProjectArt`

A project with a `cover` shows that image. Otherwise `ProjectArt` draws an SVG chosen by slug (the `ART` map in
`src/components/ProjectArt.tsx`). **A new project needs either a `cover` or a new `ART` entry,** or
it shows an empty frame (as `multimodal-agentic-system` does today).

### `ProjectVideo`

| Field | Meaning |
|---|---|
| `src` | MP4 fallback |
| `webm` | WebM fallback |
| `stream` | HLS playlist from `scripts/make-hls.sh`. **Set it for every video** (see [videos.md](videos.md)). |
| `poster` | Still before playback |
| `bg` | Background behind the frame |
| `title` | Heading above the video (for second and later videos) |
| `sound` | Show the sound toggle |
| `speedup` | Show the 1x/2x toggle |
| `fullscreen` | Show the full-screen button (turns sound on) |
| `crop` | Legacy, no effect |

The first video on a page is full-bleed; later ones are in a rounded block.

## `buddy.ts`

Everything the site buddy says, and every tour. **When content changes, update the buddy in the same change**
([buddy.md: keep it in sync](buddy.md#keep-the-buddy-in-sync-with-the-site)), then run `npm run qa:buddy`.
For a new project, add a `NOTES['<slug>']` entry (a one-line intro plus explanations for its highlights,
videos and flow); without one, the buddy falls back to the project's `summary` and generic lines.

## Adding a project: checklist

1. Add an entry to `PROJECTS` in the position you want it on the Work page.
2. Give it a `cover` (in `public/images/projects/<slug>/`) or an `ART` drawing.
3. Fill `intro`, `sections` and `links`, plus `highlights`, `flow` and `gallery` where they help.
4. For a video: put the MP4 in `public/videos/`, run `npm run hls -- public/videos/<name>.mp4`, and set `video: { src, stream }`.
5. Add `NOTES['<slug>']` in `src/data/buddy.ts` (and a `SITE_TOUR` stop if it's a headline project).
6. Set `featured: true` if it belongs in Home "Recent work". Five or six featured projects read best.
7. Run the checks in [testing.md](testing.md). `npm run qa` and `npm run qa:buddy` pick up the new slug automatically.
