export type ExperienceMetric = { label: string; value: string };

export type ExperienceEntry = {
  id: string;
  role: string;
  org: string;
  duration: string;
  location: string;
  type: 'Remote' | 'On-site' | 'Hybrid';
  status: 'active' | 'completed';
  description: string;
  tags: string[];
  metrics?: ExperienceMetric[];
  accentColor: string;
  initials: string;
  logoBg: string;
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'gsoc-2026',
    role: 'Open Source Contributor',
    org: 'Google Summer of Code 2026',
    duration: 'May 2026 – Aug 2026 · 4 months',
    location: 'Remote',
    type: 'Remote',
    status: 'active',
    description:
      "Selected as a contributor in the world's largest open source mentorship program, hosted by Google. Working on a medical imaging research project with international mentors.",
    tags: ['Open Source', 'Research', 'Medical Imaging', 'Python'],
    accentColor: '#4285F4',
    initials: 'GSoC',
    logoBg: 'linear-gradient(135deg,#4285F4,#34A853)',
  },
  {
    id: 'ml4sci',
    role: 'Research Contributor — PREDICT1',
    org: 'Machine Learning for Science (ML4Sci)',
    duration: 'May 2026 – Aug 2026 · Ongoing',
    location: 'Remote',
    type: 'Remote',
    status: 'active',
    description:
      'Building and comparing segmentation strategies for Coronary Artery Calcium (CAC) detection using deep learning on the Stanford COCA dataset. Achieved median Dice score of 0.9416 with a 3,157× inference speedup over the TotalSegmentator baseline.',
    tags: ['Deep Learning', 'U-Net', 'Medical Imaging', 'PyTorch', 'Computer Vision'],
    metrics: [
      { label: 'Dice', value: '0.9416' },
      { label: 'Speedup', value: '3,157×' },
    ],
    accentColor: '#0057ff',
    initials: 'ML4Sci',
    logoBg: 'linear-gradient(135deg,#0057ff,#1a1a2e)',
  },
  {
    id: 'gdg',
    role: 'Co-Lead — Artificial Intelligence and Machine Learning',
    org: 'Google Developer Groups On Campus, Nashik',
    duration: 'Sep 2024 – Sep 2025 · 1 yr 1 mo',
    location: 'Nashik, Maharashtra, India',
    type: 'On-site',
    status: 'completed',
    description:
      'Led the AI & ML vertical of GDG On Campus Nashik. Organized hands-on sessions, connected students across the campus community, and mentored peers in Artificial Intelligence, Machine Learning, and Generative AI.',
    tags: ['Artificial Intelligence', 'Machine Learning', 'Generative AI', 'Leadership', 'Community'],
    accentColor: '#34A853',
    initials: 'GDG',
    logoBg: 'linear-gradient(135deg,#4285F4,#EA4335,#FBBC04,#34A853)',
  },
];
