# Soham Jadhav — portfolio

Personal site of Soham Jadhav, AI / ML engineer and researcher.
Built with Vite, React, TypeScript, GSAP and Lenis (smooth scroll).

## Run it

```sh
npm install
npm run dev       # local dev server
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Pages

| Route | What it shows |
|---|---|
| `/` | Hero with photo and sliding name, intro, recent work, footer |
| `/work` | All projects, with filters and a list / grid switch |
| `/work/<slug>` | One page per project (case study) |
| `/about` | Story, services, papers, experience, certificates |
| `/contact` | Contact form (Web3Forms) and details |

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

## Contact form

The form posts to [Web3Forms](https://web3forms.com). Messages go to
soham.ai.engineer@gmail.com. The access key is in `site.ts`; it's public by design.

## Hosting

This is a single-page app: every route must serve `index.html`.
`public/_redirects` (Netlify) and `vercel.json` (Vercel) already handle this.

The `portfolio-video*` folders are separate video projects and are not part of the site.
