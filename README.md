# Soham Jadhav — portfolio

Personal site of Soham Jadhav, AI / ML engineer and researcher.
Built with Vite, React, TypeScript, GSAP and Lenis (smooth scroll).

## Run it

```sh
npm install
npm run dev       # local dev server (port 8080)
npm run build     # production build in dist/
npm run preview   # serve the build
npm run qa        # check every page at desktop and phone size (needs the preview running)
npm run qa:buddy  # check that the buddy's tours still point at real things on each page
npm run hls -- public/videos/<name>.mp4   # turn a video into a stream (needs ffmpeg)
```

## Documentation

How it's built and how to change it safely: **[docs/README.md](docs/README.md)**. It covers architecture,
the content model, the site buddy, videos, testing, workflow and past decisions. Agents: read `AGENTS.md` first.

## Pages

| Route | What it shows |
|---|---|
| `/` | Hero with photo and sliding name, intro, recent work, footer |
| `/work` | All projects, with filters and a list / grid switch |
| `/work/<slug>` | One page per project (case study) |
| `/about` | Story, services, papers, experience, certificates |
| `/contact` | Contact form (Web3Forms) and details |
| `/lab/buddy` | Hidden page for comparing the buddy characters (not linked, not indexed) |

## Updating content

Text and links live in `src/data/`. You never need to touch components for content.

- **`site.ts`**: name, role, location, email, phone, résumé link, socials, photo paths.
- **`projects.ts`**: every project and its page. The order here is the order on the site.
  `featured: true` puts a project in "Recent work" on Home.
- **`about.ts`**: services, papers, experience, certificates.

### Add a project image

1. Put the image in `public/images/projects/<slug>/` (WebP or JPG, about 1600px wide).
2. In `projects.ts`, set `cover: '/images/projects/<slug>/cover.webp'` on that project.
   Until a cover is set, a drawn illustration is shown instead.
3. Extra screenshots or diagrams go in `gallery` with a caption.

### Add a live demo or other link

Add `{ label: 'Live demo', href: 'https://…' }` to the project's `links`.
The first link becomes the round blue button on the project page.

### Add a screen recording

1. Put the video in `public/videos/` (MP4, 1280×720 or 1920×1080, under 25 MB).
2. Turn it into a stream: `scripts/make-hls.sh public/videos/<name>.mp4` (needs ffmpeg).
   This writes `public/videos/<name>/` with a playlist and small pieces.
3. On the project in `projects.ts`, set
   `video: { src: '/videos/<name>.mp4', stream: '/videos/<name>/index.m3u8', poster: '/videos/<name>.webp' }`.
   Add `webm` for a WebM copy and `sound: true` if it has narration.
   For a long tutorial, `fullscreen: true` adds a full-screen button that also turns the sound on.

### Projects without a website

A project page tells the story on its own: the problem, the approach, big result
numbers, a "how it works" flow (`flow`), a command or sample output (`sample`)
and figures (`gallery`). A short screen recording, a diagram or a results chart
makes a backend project as convincing as a live demo.

### Photos

`public/images/soham/`: `hero.webp` (background removed), `avatar.webp` (round photo)
and `about.webp`. Replace a file with the same name to swap a photo.

### Certificates

Images are in `public/images/certificates/` and PDFs in `public/certificates/`.
Add an entry to `CERTIFICATES` in `about.ts`.

## Site buddy

A small character (Nimbus, the cloud) lives in the bottom-right corner and guides visitors:

- **Intro:** when someone opens a page, it says in a few words what the page is,
  offers a tour of that page and suggests somewhere else to go (once per page per visit).
- **Suggestions:** every hover or click shows a different one: tips for the page,
  random projects (ones the visitor hasn't opened first), About, Contact, the big tour.
- **Tours play on their own:** the buddy floats next to each part of the page, points at it
  with its hand and explains it. The rest of the page dims for about 2.5 seconds.
  Under the buddy: pause / carry on, next, and **End tour**. Scrolling pauses the tour;
  going to another page by yourself ends it; Esc ends it too.
  - **1-minute tour** of the whole site: About first, then the projects, then Contact.
  - **Page tours** for Home, Work, About, Contact and every project.
- Visitors can close it with the × (it blows away like dust) and bring it back with the small dot.

To change it:

- **Switch character:** in `src/data/buddy.ts`, set `character` to `'bit'`, `'nimbus'` or
  `'pico'` and `name` to match. Compare them at `/lab/buddy` (hidden page).
- **Words and tours** are all in `src/data/buddy.ts`:
  - `PAGES`: intro, tour stops and tips for Home, Work, About and Contact.
  - `NOTES`: a one-line intro and explanations for each project (its tour is built from
    what the project page shows: videos, highlights, flow, code link).
  - `SITE_TOUR`: the 1-minute tour. Each stop is `{ to, target, text }`, where `target` is a
    CSS selector on that page, plus optional buttons (play a video with sound, open a link).
  - `LINES`: everything else it says.
- **From a page:** `buddy.say('Hi!')` or `buddy.feel('proud', 3000)` from `src/lib/buddy.ts`.
- **Test the idle moods quickly:** add `?buddyfast` to the URL (sad after 2.5 s, asleep after 6 s).
- **Keep it in sync:** whenever you change site content (a project, numbers, a video, a paper, a page section),
  update the buddy's lines and tours in `src/data/buddy.ts` too, then run `npm run qa:buddy`.
  The table in [docs/buddy.md](docs/buddy.md#keep-the-buddy-in-sync-with-the-site) says what to update for each change.

## Contact form

The form posts to [Web3Forms](https://web3forms.com). Messages go to
soham.ai.engineer@gmail.com. The access key is in `site.ts`; it's public by design.

## Videos stream in small pieces

The host (Cloudflare Pages) can't send part of a file, so a browser can't jump
into the middle of one big MP4: clicking the timeline would restart the video.
That's why every video also has an HLS stream (`stream`), made by
`scripts/make-hls.sh`. Each ~4-second piece is its own small file, so jumping
anywhere just loads the right piece. The MP4 (and WebM) stay as a fallback.
If you replace a video, run the script again for it.

## Hosting

This is a single-page app: every route must serve `index.html`.
`public/_redirects` (Netlify) and `vercel.json` (Vercel) already handle this.

The `portfolio-video*` folders are separate video projects and are not part of the site.
