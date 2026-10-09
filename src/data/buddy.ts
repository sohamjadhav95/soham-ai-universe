// The site buddy: which character is on the site, and everything it says.
// To switch characters, change `character` to 'bit', 'nimbus' or 'pico'
// (and `name` to match). All three live in src/components/buddy/.
//
// What the buddy says on each page lives here too:
// - PAGES: a short intro and a guided tour for Home, Work, About and Contact.
// - NOTES: a one-line intro and explanations for each project page.
// - SITE_TOUR: the one-minute tour of the whole site.

import { CERTIFICATES, PAPERS } from './about';
import { PROJECTS, getProject, nextProject, type Project } from './projects';

export type BuddyCharacter = 'bit' | 'nimbus' | 'pico';

export const BUDDY: { character: BuddyCharacter; name: string } = {
  character: 'nimbus',
  name: 'Nimbus',
};

/** A button in the speech bubble. */
export type BuddyAction =
  | { kind: 'go'; label: string; to: string; target?: string; nth?: number } // travel to a page (and point at a part of it)
  | { kind: 'tour'; label: string; tour: 'site' | 'page' } // start a tour
  | { kind: 'link'; label: string; href: string } // open a link in a new tab
  | { kind: 'play'; label: string; target: string; nth?: number; fullscreen?: boolean } // play a video with sound
  | { kind: 'close'; label: string }; // just close the bubble

export type Tip = { text: string; actions?: BuddyAction[] };

/** One stop of a tour: the buddy floats next to `target`, points at it and explains. */
export type Step = { to: string; target: string; nth?: number; text: string; actions?: BuddyAction[]; ms?: number };

/** How long a stop stays on screen: long enough to read, never dragging. */
export const stepTime = (s: Step) => s.ms ?? Math.min(9000, Math.max(5200, 2600 + s.text.length * 48));

const go = (label: string, to: string, target?: string, nth?: number): BuddyAction => ({ kind: 'go', label, to, target, nth });
export const SITE_TOUR_ACTION: BuddyAction = { kind: 'tour', label: 'Take the 1-minute tour', tour: 'site' };
export const LATER: BuddyAction = { kind: 'close', label: 'Maybe later' };

/* ── Projects ─────────────────────────────────────────── */

type Note = {
  intro: string; // a few words: what this project is
  video?: string[]; // one line per video, in order
  iframe?: string;
  highlights?: string;
  section?: { nth: number; text: string }; // a section worth pointing at
  flow?: string;
  link?: string;
};

export const NOTES: Record<string, Note> = {
  'multimodal-agentic-system': {
    intro: 'The research paper behind Convo-Ease: one AI that moderates text, images and audio.',
    iframe: 'Want to read the paper? It’s right here on this screen.',
    highlights: 'Plain-English rules lift recall from 46% to 77%, and the gain is statistically real.',
    flow: 'How text, images and audio flow through one gatekeeper.',
  },
  'predict-cac-segmentation': {
    intro: 'Soham’s own idea: train calcium models on exact sub-pixel labels, not blocky pixels.',
    iframe: 'His GSoC blog, live on this screen: how the sub-pixel idea came together.',
    highlights: 'These numbers show the gain: label error from 10.19% down to 0.03%, scoring error halved.',
    section: { nth: 1, text: 'This is the new part: Approach 3, the sub-pixel labels.' },
    link: 'All the code is open. Have a look.',
  },
  'note-insight': {
    intro: 'A clinical notes workspace: it pulls conditions and ICD-10 codes out of doctors’ free-text notes.',
    highlights: 'Every phrase it extracts is matched back to its exact place in the note, so nothing is made up.',
    flow: 'From a doctor’s note to signed-off codes, in four steps.',
    link: 'There’s a live demo. Want to try it?',
  },
  'predict-studio': {
    intro: 'A workstation that turns a heart CT scan into a calcium score, with all the evidence.',
    video: ['Here it is in action: a scan goes in, a score comes out.', 'Watch this one to learn how to use it, step by step.'],
    highlights: 'Nine steps from raw scan to report, and four ways to check every result.',
    flow: 'How a scan becomes a score, one step at a time.',
  },
  'convo-ease': {
    intro: 'Checks every chat message against company rules before anyone sees it.',
    highlights: 'Company rules lift recall from 46% to 77%, with zero retraining.',
    flow: 'How one message gets checked, in under half a second per batch.',
    link: 'It’s published and peer-reviewed. Want to read the paper?',
  },
  'copilot-for-data-science': {
    intro: 'Ask a data question in plain English and get the whole pipeline.',
    highlights: 'It automates about 90% of a typical data-science workflow.',
    flow: 'From your question to a finished answer.',
  },
  'heart-segmentation': {
    intro: 'Finds the heart in a CT scan, 63× faster than TotalSegmentator.',
    highlights: 'Dice of 0.94, in 0.6 seconds per scan instead of 37.8.',
  },
  'renaissance-ocr': {
    intro: 'Reads historical Spanish documents with deep learning.',
    flow: 'From a scanned page to plain text.',
  },
  'tennis-match-predictor': {
    intro: 'Predicts ATP match winners with 77% accuracy.',
    link: 'There’s a live demo. Want to try it?',
  },
  'nexaos-flow': {
    intro: 'Control your computer with your voice.',
    flow: 'From your voice to an action on screen.',
  },
};

const introOf = (p: Project) => NOTES[p.slug]?.intro ?? p.summary;

const linkVerb = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('paper') || l.includes('preprint')) return 'Read the paper ↗';
  if (l.includes('demo')) return 'Try the live demo ↗';
  if (l.includes('code')) return 'Open the code ↗';
  return `${label} ↗`;
};

/** The tour of one project page, built from what that page shows. */
function projectTour(p: Project): Step[] {
  const n = NOTES[p.slug] ?? { intro: p.summary };
  const to = `/work/${p.slug}`;
  const steps: Step[] = [];
  const videos = p.videos ?? (p.video ? [p.video] : []);
  videos.forEach((v, i) => {
    steps.push({
      to,
      target: '.case-device .video-frame',
      nth: i,
      text: n.video?.[i] ?? (i === 0 ? 'Here it is in action.' : 'One more video, worth a look.'),
      actions: v.fullscreen
        ? [{ kind: 'play', label: 'Watch full screen', target: '.case-device .video-frame', nth: i, fullscreen: true }]
        : v.sound
          ? [{ kind: 'play', label: 'Play with sound', target: '.case-device .video-frame', nth: i }]
          : undefined,
    });
  });
  if (p.iframe) {
    const cover = p.iframe.cover;
    steps.push({
      to,
      target: '.case-monitor .monitor-frame',
      text: n.iframe ?? 'Try it right here on this screen.',
      actions: cover ? [{ kind: 'link', label: `${cover.cta ?? 'Read the paper'} ↗`, href: cover.href }] : undefined,
    });
  }
  if (!videos.length && !p.iframe) steps.push({ to, target: '.case-hero .frame', text: n.intro });
  if (p.highlights) {
    const h = p.highlights[0];
    steps.push({ to, target: '.case-highlights', text: n.highlights ?? `These numbers are the results. ${h.value}: ${h.label.toLowerCase()}.` });
  }
  if (n.section && p.sections[n.section.nth]) steps.push({ to, target: '.case-section', nth: n.section.nth, text: n.section.text });
  if (p.flow) steps.push({ to, target: '.case-flow', text: n.flow ?? `${p.flow.title}, step by step.` });
  if (p.sample) steps.push({ to, target: '.case-sample', text: 'A real command, if you want to run it yourself.' });
  if (p.gallery?.length) steps.push({ to, target: '.case-gallery', text: 'Figures from the experiments.' });
  const primary = p.links[0];
  if (primary) {
    steps.push({
      to,
      target: '.case-hero .btn-wrapper',
      text: n.link ?? 'The code is open. Have a look.',
      actions: [{ kind: 'link', label: linkVerb(primary.label), href: primary.href }],
    });
  }
  return steps.slice(0, 6);
}

/* ── Pages ────────────────────────────────────────────── */

type Page = { intro: string; tour: Step[]; tips: Tip[] };

/** Soham's GSoC blog (shown on the PrediCT CAC monitor and in About → Writings). */
const BLOG = getProject('predict-cac-segmentation')?.iframe?.cover?.href;

const PAGES: Record<string, Page> = {
  '/': {
    intro: 'This is Soham’s corner of the web: who he is and his best work.',
    tour: [
      { to: '/', target: '.home-intro .statement', text: 'Soham in one line: research turned into AI that works in the real world.' },
      { to: '/', target: '.home-work', text: 'His recent work. Hover a project to preview it, click to open it.' },
      { to: '/', target: '.home-more', text: `All ${PROJECTS.length} projects are behind this button.` },
      { to: '/', target: '.footer-title', text: 'And this is how you reach him. He replies!' },
    ],
    tips: [
      {
        text: 'Hey! Want to see how I got un-pixelated?',
        actions: [go('PrediCT CAC →', '/work/predict-cac-segmentation', '.case-highlights')],
      },
      { text: 'Hover a project in Recent work and a preview pops up.', actions: [go('Show me ↓', '/', '.home-work')] },
    ],
  },
  '/work': {
    intro: `All ${PROJECTS.length} of Soham’s projects. Filter them, or switch to a grid.`,
    tour: [
      { to: '/work', target: '.work-filters', text: 'Filter by research or engineering, or switch between list and grid.' },
      { to: '/work', target: '.work-list', text: 'Every project. Hover one for a preview, click to open it.' },
      { to: '/work', target: '.work-archive', text: 'Even more code lives on GitHub.' },
    ],
    tips: [{ text: 'Research or engineering? The filters up top sort it out.', actions: [go('Show me ↑', '/work', '.work-filters')] }],
  },
  '/about': {
    intro: 'About Soham: his story, a short film, papers and experience.',
    tour: [
      { to: '/about', target: '.about-intro .text', text: 'Who he is, in three short paragraphs.' },
      {
        to: '/about',
        target: '.about-film .video-frame',
        text: 'The 50-second film. It’s better with sound.',
        actions: [{ kind: 'play', label: 'Play with sound', target: '.about-film .video-frame' }],
      },
      { to: '/about', target: '.services-grid', text: 'What he can do for you: research, engineering, or both.' },
      {
        to: '/about',
        target: '.paper-list',
        text: 'Two published papers on keeping workplace chats safe.',
        actions: [{ kind: 'link', label: 'Read the paper ↗', href: PAPERS[0].href }],
      },
      { to: '/about', target: '.exp-list', text: 'Right now: Google Summer of Code with ML4Sci. That’s where PrediCT began.' },
      {
        to: '/about',
        target: '.writing-list',
        text: 'He writes too: his GSoC blog on how the sub-pixel idea came together.',
        actions: BLOG ? [{ kind: 'link', label: 'Read the blog ↗', href: BLOG }] : undefined,
      },
      { to: '/about', target: '.about-block .table-list', text: `And ${CERTIFICATES.length} certificates. Hover one to see it.` },
    ],
    tips: [
      {
        text: 'Psst, the film has sound. Want to watch?',
        actions: [go('Take me there ↓', '/about', '.about-film .video-frame')],
      },
      { text: 'Two papers, both published!', actions: [go('See the papers ↓', '/about', '.paper-list')] },
      { text: 'Soham writes too. His GSoC blog is down here.', actions: [go('Show me ↓', '/about', '.writing-list')] },
    ],
  },
  '/contact': {
    intro: 'Want to work with Soham? Say hi here. It goes straight to him.',
    tour: [
      { to: '/contact', target: '.contact-form', text: 'Fill this in and your message goes straight to his inbox.' },
      { to: '/contact', target: '.contact-body .side', text: 'Or email, call, or grab the résumé here.' },
    ],
    tips: [{ text: 'Say hi! I’ll make sure Soham sees it.', actions: [go('Start typing ↓', '/contact', '.contact-form')] }],
  },
};

/* ── Route guard ──────────────────────────────────────────
   Content is also edited in Lovable and on GitHub, where nobody runs the
   checks. So the buddy never offers a page that doesn't exist: stops, tips
   and buttons for a missing route are dropped (and listed by buddyProblems()). */

const PAGE_ROUTES = ['/', '/work', '/about', '/contact'];

export const routeExists = (to: string) => PAGE_ROUTES.includes(to) || (to.startsWith('/work/') && !!getProject(to.slice(6)));

const actionOk = (a: BuddyAction) => a.kind !== 'go' || routeExists(a.to);

/** A tip whose only buttons lead nowhere is dropped; otherwise its dead buttons are. */
const cleanTips = (tips: Tip[]) =>
  tips.flatMap(t => {
    if (!t.actions?.length) return [t];
    const actions = t.actions.filter(actionOk);
    return actions.length ? [{ ...t, actions }] : [];
  });

const cleanSteps = (steps: Step[]) =>
  steps.filter(s => routeExists(s.to)).map(s => (s.actions ? { ...s, actions: s.actions.filter(actionOk) } : s));

/** Intro, tour and tips for any route. */
export function guideFor(path: string): Page {
  const page = rawGuideFor(path);
  return { ...page, tour: cleanSteps(page.tour), tips: cleanTips(page.tips) };
}

function rawGuideFor(path: string): Page {
  if (path.startsWith('/work/')) {
    const p = getProject(path.slice(6));
    if (p) {
      const next = nextProject(p.slug);
      return {
        intro: introOf(p),
        tour: projectTour(p),
        tips: p.highlights ? [{ text: 'The big numbers are just below.', actions: [go('Show me ↓', path, '.case-highlights')] }] : [{ text: `Next on the list: ${next.title}.`, actions: [go(`${next.title} →`, `/work/${next.slug}`)] }],
      };
    }
  }
  return PAGES[path] ?? { intro: 'Lost? I know the way around.', tour: [], tips: [{ text: 'Lost? I know the way.', actions: [SITE_TOUR_ACTION, go('Go home →', '/')] }] };
}

/** Seconds a tour takes, rounded for the button label. */
export const tourSeconds = (steps: Step[]) => Math.max(10, Math.round(steps.reduce((t, s) => t + stepTime(s) + 900, 0) / 5000) * 5);

/* ── Suggestions ──────────────────────────────────────── */

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** A project worth recommending, as a tip: unseen ones first, in random order. */
const recommend = (p: Project): Tip => ({
  text: `Have you seen ${p.title}? ${introOf(p)}`,
  actions: [go(`Open ${p.title} →`, `/work/${p.slug}`)],
});

/** Everything the buddy can suggest on this page, shuffled. Hover or click shows the next one. */
export function suggestionsFor(path: string, seen: string[]): Tip[] {
  const page = guideFor(path);
  const here = path.startsWith('/work/') ? path.slice(6) : '';
  const others = PROJECTS.filter(p => p.slug !== here);
  const unseen = shuffle(others.filter(p => !seen.includes(p.slug)));
  const picks = [...unseen, ...shuffle(others.filter(p => seen.includes(p.slug)))].slice(0, 3);
  const pool: Tip[] = [...page.tips, ...picks.map(recommend)];
  if (page.tour.length > 1) {
    pool.push({ text: `Want a quick tour of this page? About ${tourSeconds(page.tour)} seconds.`, actions: [{ kind: 'tour', label: 'Show me around', tour: 'page' }] });
  }
  pool.push({ text: 'Want the 1-minute tour of everything? I’ll do the walking.', actions: [SITE_TOUR_ACTION] });
  if (path !== '/about') pool.push({ text: 'Curious who built all this? Meet Soham.', actions: [go('About him →', '/about')] });
  if (path !== '/contact') pool.push({ text: 'Like what you see? Say hi. Soham replies.', actions: [go('Say hi →', '/contact', '.contact-form')] });
  return shuffle(pool);
}

/** The intro when someone opens a page on their own: what it is, a tour of it, and somewhere else to go. */
export function introFor(path: string, seen: string[]): Tip {
  const page = guideFor(path);
  const actions: BuddyAction[] = [];
  if (page.tour.length > 1) actions.push({ kind: 'tour', label: `Tour this page · ${tourSeconds(page.tour)} s`, tour: 'page' });
  const rec = suggestionsFor(path, seen).find(t => {
    const a = t.actions?.[0];
    return a?.kind === 'go' && a.to !== path;
  });
  if (rec?.actions) actions.push(rec.actions[0]);
  return { text: page.intro, actions };
}

/* ── The one-minute tour: About first, then the projects, then Contact ── */

const cac = getProject('predict-cac-segmentation');

const RAW_SITE_TOUR: Step[] = [
  { to: '/about', target: '.about-intro .text', text: 'First, meet Soham: an AI / ML engineer and researcher from Pune.' },
  {
    to: '/about',
    target: '.about-film .video-frame',
    text: 'His story in 50 seconds. Tap the sound icon to hear it.',
    actions: [{ kind: 'play', label: 'Play with sound', target: '.about-film .video-frame' }],
  },
  {
    to: '/about',
    target: '.paper-list',
    text: 'Two published papers on keeping workplace chats safe.',
    actions: [{ kind: 'link', label: 'Read the paper ↗', href: PAPERS[0].href }],
  },
  { to: '/about', target: '.exp-list', text: 'Right now: Google Summer of Code with ML4Sci. That’s where the next two came from.' },
  {
    to: '/work/predict-cac-segmentation',
    target: '.case-highlights',
    text: NOTES['predict-cac-segmentation']?.highlights ?? cac?.summary ?? '',
  },
  { to: '/work/predict-studio', target: '.case-device .video-frame', nth: 0, text: 'PrediCT Studio: a heart CT scan goes in, a calcium score comes out.' },
  {
    to: '/work/predict-studio',
    target: '.case-device .video-frame',
    nth: 1,
    text: 'Watch this to learn how to use it, step by step.',
    actions: [{ kind: 'play', label: 'Watch full screen', target: '.case-device .video-frame', nth: 1, fullscreen: true }],
  },
  {
    to: '/work/multimodal-agentic-system',
    target: '.case-monitor .monitor-frame',
    text: 'Want to read a paper? This one is right here on the screen.',
    actions: [{ kind: 'link', label: 'Open the paper ↗', href: PAPERS[0].href }],
  },
  { to: '/contact', target: '.contact-form', text: 'And this is where you say hi. I’ll wait right here.' },
];

export const SITE_TOUR: Step[] = cleanSteps(RAW_SITE_TOUR);

/**
 * Everything in this file that no longer matches the site's content: tour
 * stops and buttons for routes that don't exist, and notes for projects that
 * don't exist (usually a renamed slug). Shown by `npm run qa:buddy`, and as a
 * warning in the dev console.
 */
export function buddyProblems(): string[] {
  const out: string[] = [];
  RAW_SITE_TOUR.forEach((s, i) => {
    if (!routeExists(s.to)) out.push(`1-minute tour stop ${i + 1} goes to ${s.to}, which doesn't exist`);
  });
  for (const route of [...PAGE_ROUTES, ...PROJECTS.map(p => `/work/${p.slug}`)]) {
    const page = rawGuideFor(route);
    for (const t of page.tips)
      for (const a of t.actions ?? []) if (!actionOk(a)) out.push(`tip on ${route} ("${t.text.slice(0, 40)}…") links to ${(a as { to: string }).to}, which doesn't exist`);
    for (const s of page.tour)
      for (const a of s.actions ?? []) if (!actionOk(a)) out.push(`tour stop on ${route} links to ${(a as { to: string }).to}, which doesn't exist`);
  }
  for (const slug of Object.keys(NOTES)) if (!getProject(slug)) out.push(`NOTES['${slug}'] is for a project that doesn't exist (renamed slug?)`);
  return out;
}

if (import.meta.env?.DEV) {
  const problems = buddyProblems();
  if (problems.length) console.warn(`[buddy] src/data/buddy.ts is out of sync with the content:\n- ${problems.join('\n- ')}`);
}

/* ── Everything else it says ──────────────────────────── */

export const LINES = {
  greet(hour: number, name: string) {
    const hi =
      hour >= 5 && hour < 12 ? 'Good morning!' : hour >= 12 && hour < 17 ? 'Good afternoon!' : hour >= 17 && hour < 22 ? 'Good evening!' : 'Still up? Me too.';
    return `${hi} I’m ${name}. Want a 1-minute tour of Soham’s work?`;
  },
  unseen: (title: string) => `Welcome back! You haven’t seen ${title} yet.`,
  welcomeBack: 'Welcome back! Want the 1-minute tour?',
  landed: 'Here it is!',
  bored: 'Still there? There’s more below…',
  boredBottom: 'That’s everything here. Want a tour?',
  back: 'I’m back!',
  tickle: 'Hehe, that tickles!',
  dizzy: 'Whoa… everything’s spinning.',
  poke: 'Hey, stop poking!',
  egg: 'Uh oh, pixelated… A3 to the rescue!',
  papers: 'Peer-reviewed!',
  film: 'Psst, it has sound.',
  typing: 'Ooh, keep going!',
  sent: 'Sent! Soham will get back to you soon.',
  error: 'Oh no, it didn’t send. Try the email link?',
  paused: 'Paused. Take your time, then press ▶.',
  watching: 'Enjoy! The tour waits for you. Press ▶ to carry on.',
  siteTourDone: 'That’s the tour! Say hi anytime.',
  pageTourDone: 'That’s this page. Where next?',
  later: 'Okay! Hover me anytime.',
};

/** Projects the visitor hasn't opened yet, in site order. */
export const unseenProjects = (seen: string[]) => PROJECTS.filter(p => !seen.includes(p.slug));
