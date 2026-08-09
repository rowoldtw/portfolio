type ThemeImage = {
  light: string
  dark: string
}

type Project = {
  name: string
  description: string
  link: string
  image: ThemeImage
  id: string
}

type WorkExperience = {
  company: string
  title: string
  start: string
  end: string
  link: string
  id: string
  image: ThemeImage
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
    name: 'Chimera',
    description:
      'AI-powered fitness tracker with personalized workouts and progress tracking.',
    link: 'https://woodrowrowoldt.com',
    image: {
      light:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
      dark: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85',
    },
    id: 'project1',
  },
  {
    name: 'Astraea',
    description:
      'Powerful yet efficient AI agent optimized for facial recognition and analysis.',
    link: 'https://woodrowrowoldt.com',
    image: {
      light:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
      dark: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=85',
    },
    id: 'project2',
  },
]

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Chimera',
    title: 'Founder',
    start: '2024',
    end: 'Present',
    link: 'https://woodrowrowoldt.com',
    id: 'work1',
    image: {
      light:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
      dark: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85',
    },
  },
  {
    company: 'Freelance',
    title: 'Care Giver',
    start: '2023',
    end: '2024',
    link: 'https://woodrowrowoldt.com',
    id: 'work2',
    image: {
      light:
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85',
      dark: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85',
    },
  },
  {
    company: 'Sagano, Oak Park',
    title: 'Waiter / Server',
    start: '2022',
    end: '2023',
    link: 'https://woodrowrowoldt.com',
    id: 'work3',
    image: {
      light:
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
      dark: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85',
    },
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
    label: 'X',
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
]

export const SKILLS = [
  'Machine learning',
  'Neural networks',
  'Computer vision',
  'Python',
  'TypeScript',
  'React / Next.js',
]

export const EMAIL = 'me@woodrowrowoldt.com'
