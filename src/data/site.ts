// Everything personal about the site lives here, so updating a link or a line
// of text never means digging through components.

export const SITE = {
  name: 'Soham Jadhav',
  firstName: 'Soham',
  lastName: 'Jadhav',
  // Hero, right side: small first line + main line.
  roleTop: 'AI / ML',
  roleMain: 'Engineer & Researcher',
  mission: 'Building AI for good faith of humanity.',
  location: {
    badge: ['Located', 'in', 'India'],
    city: 'Pune, India',
    timeZone: 'Asia/Kolkata',
    tzLabel: 'IST',
  },
  email: 'soham.ai.engineer@gmail.com',
  phone: '+91 77760 02086',
  phoneHref: 'tel:+917776002086',
  resume: 'https://drive.google.com/file/d/10eYoeO_1K7sKIE37kUY7jX7kA3hVJWa9/view?usp=sharing',
  version: '2026 © Edition',
  // Web3Forms keys are public by design: they only allow sending mail to this inbox.
  web3formsKey: '55e4ae9f-f97a-4086-a313-8b6680e9a531',
  socials: [
    { label: 'GitHub', href: 'https://github.com/sohamjadhav95' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sohamjadhav95' },
    { label: 'X / Twitter', href: 'https://x.com/sohamjadhav_95' },
    { label: 'Instagram', href: 'https://www.instagram.com/sohamjadhav95' },
  ],
  photos: {
    hero: '/images/soham/hero.webp',
    avatar: '/images/soham/avatar.webp',
    about: '/images/soham/about.webp',
  },
} as const;

export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
] as const;

// First-visit loader greetings. Ends in Marathi: home.
export const GREETINGS = ['Hello', 'Bonjour', 'नमस्ते', 'Ciao', 'Olá', 'こんにちは', 'Hola', 'Hallo', 'नमस्कार'];
