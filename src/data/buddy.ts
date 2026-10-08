// The site buddy: which character is on the site, and everything it says.
// To switch characters, change `character` to 'bit', 'nimbus' or 'pico'
// (and `name` to match). All three live in src/components/buddy/.

import { PROJECTS, getProject, nextProject } from './projects';

export type BuddyCharacter = 'bit' | 'nimbus' | 'pico';

export const BUDDY: { character: BuddyCharacter; name: string } = {
  character: 'nimbus',
  name: 'Nimbus',
};

/** Where an action takes the visitor: a route, and optionally a section on it to point at. */
export type BuddyAction = { label: string; to: string; target?: string } | { label: string; tour: true };

export type Tip = { text: string; action?: BuddyAction };

const TOUR_ACTION: BuddyAction = { label: 'Show me around', tour: true };

const PAGE_TIPS: Record<string, Tip[]> = {
  '/': [
    {
      text: 'Hey! Want to see how I got un-pixelated?',
      action: { label: 'Sub-pixel CAC →', to: '/work/subpixel-cac-segmentation' },
    },
    {
      text: 'PrediCT Studio turns a heart CT scan into a risk score, with all the evidence.',
      action: { label: 'Show me →', to: '/work/predict-studio' },
    },
    { text: 'New here? I can show you the best bits.', action: TOUR_ACTION },
  ],
  '/work': [
    {
      text: 'My favourite: Convo-Ease checks messages before anyone reads them.',
      action: { label: 'See Convo-Ease →', to: '/work/convo-ease' },
    },
    { text: 'Hover any project and I’ll take a peek too.', action: TOUR_ACTION },
  ],
  '/about': [
    { text: 'Psst, the film has sound. Want to watch?', action: { label: 'Take me there ↓', to: '/about', target: '.about-film' } },
    { text: 'Two papers, both peer-reviewed!', action: { label: 'See the papers ↓', to: '/about', target: '.paper-list' } },
  ],
  '/contact': [
    { text: 'Say hi! I’ll make sure Soham sees it.', action: { label: 'Start typing ↓', to: '/contact', target: '.contact-form' } },
  ],
};

export function tipsFor(pathname: string): Tip[] {
  if (pathname.startsWith('/work/')) {
    const slug = pathname.slice(6);
    const next = nextProject(slug);
    const here = getProject(slug);
    return [
      { text: `Next up: ${next.title}. Want to go?`, action: { label: `${next.title} →`, to: `/work/${next.slug}` } },
      ...(here?.highlights ? [{ text: 'The big numbers are just below.', action: { label: 'Show me ↓', to: pathname, target: '.case-highlights' } }] : []),
    ];
  }
  return PAGE_TIPS[pathname] ?? [{ text: 'Lost? I know the way.', action: TOUR_ACTION }];
}

export const TOUR: { to: string; target: string; text: string }[] = [
  {
    to: '/work/subpixel-cac-segmentation',
    target: '.case-highlights',
    text: 'Soham’s own idea: exact sub-pixel labels. I used to be blocky. Now look at me!',
  },
  {
    to: '/work/predict-studio',
    target: '.case-device',
    text: 'PrediCT Studio: a CT scan goes in, a calcium score comes out, with every bit of evidence.',
  },
  { to: '/about', target: '.paper-list', text: 'Two peer-reviewed papers on keeping chats safe.' },
  { to: '/about', target: '.about-film', text: 'The 50-second version. It has sound!' },
  { to: '/contact', target: '.contact-form', text: 'And this is where you say hi. I’ll wait right here.' },
];

export const LINES = {
  greet(hour: number, name: string) {
    if (hour >= 5 && hour < 12) return `Good morning! I’m ${name}.`;
    if (hour >= 12 && hour < 17) return `Good afternoon! I’m ${name}.`;
    if (hour >= 17 && hour < 22) return `Good evening! I’m ${name}.`;
    return `Still up? Me too. I’m ${name}.`;
  },
  welcomeBack: 'Welcome back!',
  unseen: (title: string) => `Welcome back! You haven’t seen ${title} yet.`,
  landed: 'Here it is!',
  bored: 'Still there? There’s more below…',
  boredBottom: 'That’s everything here. Want a tour?',
  back: 'I’m back!',
  bye: 'Bye!',
  tickle: 'Hehe, that tickles!',
  dizzy: 'Whoa… everything’s spinning.',
  poke: 'Hey, stop poking!',
  egg: 'Uh oh, pixelated… A3 to the rescue!',
  papers: 'Peer-reviewed!',
  film: 'Psst, it has sound.',
  typing: 'Ooh, keep going!',
  sent: 'Sent! Soham will get back to you soon.',
  error: 'Oh no, it didn’t send. Try the email link?',
  tourDone: 'That’s the tour! Say hi anytime.',
};

/** Projects the visitor hasn't opened yet, best first. */
export const unseenProjects = (seen: string[]) => PROJECTS.filter(p => !seen.includes(p.slug));
