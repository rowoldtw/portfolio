type Project = {
  name: string
  description: string
  status: string
  id: string
}

type ConceptIdea = {
  name: string
  description: string
  status: string
  id: string
}

type WorkExperience = {
  company: string
  title: string
  date: string
  id: string
}

type JournalEntry = {
  title: string
  description: string
  link: string
  uid: string
}

type SocialLink = {
  label: string
  link: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Better PCPP',
    description:
      'An interactive 3D PC-building experience with optimized part indexing, accurate performance estimates grounded in real-world data, and step-by-step, part-specific guides.',
    status: 'Coming soon',
    id: 'project1',
  },
  {
    name: 'Astraea',
    description:
      'A post-trained LLM paired with LiDAR scanning on supported iPhone models to measure facial geometry, compare face shapes against a dataset, and assess potential health conditions and appearance characteristics from captured data rather than guesses.',
    status: 'Coming soon',
    id: 'project2',
  },
]

export const CONCEPT_IDEAS: ConceptIdea[] = [
  {
    name: 'AirPods Max redesign',
    description: 'A rounder enclosure with planar drivers and an H3 chip.',
    status: 'Renders coming soon',
    id: 'concept1',
  },
  {
    name: 'iPhone Camera Control redesign',
    description:
      'Touch ID integrated into Camera Control, replacing physical volume buttons with a haptic slider.',
    status: 'Renders coming soon',
    id: 'concept2',
  },
]

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: "Wally's Hearth",
    title: 'Volunteer IT Support',
    date: '2026',
    id: 'work1',
  },
  {
    company: 'Oak Park, IL',
    title: 'Care Giver',
    date: '2023 – 2024',
    id: 'work2',
  },
  {
    company: 'Sagano, Oak Park, IL',
    title: 'Waiter / Server',
    date: '2022 – 2023',
    id: 'work3',
  },
]

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    title: '01/01/26',
    description: 'A reflection on 2025.',
    link: '/blog/01-01-26',
    uid: 'blog-1',
  },
  {
    title: '02/01/26',
    description: 'First time contributing to OSS.',
    link: '/blog/02-01-26',
    uid: 'blog-2',
  },
  {
    title: '03/01/26',
    description: 'Building Astraea.',
    link: '/blog/03-01-26',
    uid: 'blog-3',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    link: 'https://github.com/rowoldtw',
  },
  {
    label: 'Twitter',
    link: 'https://x.com/wdsywrld',
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/woodrow-rowoldt',
  },
  {
    label: 'Instagram',
    link: 'https://www.instagram.com/whoodsy',
  },
  {
    label: 'Cal.com',
    link: 'https://cal.com',
  },
]

export const SKILLS = [
  'Python',
  'TypeScript',
  'React / Next.js',
  'Bun',
  'Three.js',
  'Machine learning',
  'Neural networks',
  'Computer vision',
]

export const FAMILIAR_TOOLS = [
  'Convex',
  'Clerk',
  'Stripe',
  'Slack',
  'Linear',
  'Git / GitHub',
  'Codex',
  'Notion',
  'Zed',
  'Vercel',
  'Resend',
]

export const CERTIFICATIONS = [
  'Harvard Online CS50x — 2025',
  'Harvard Online CS50xAI (Python)',
  'Web Animations (animations.dev)',
  'Google IT Support',
]

export const EMAIL = 'me@woodrowrowoldt.com'
