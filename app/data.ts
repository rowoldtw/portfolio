type Project = {
    name: string
    description: string
    link: string
    video: string
    id: string
}

type WorkExperience = {
    company: string
    title: string
    start: string
    end: string
    link: string
    id: string
}

type BlogPost = {
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
        video:
            'https://res.cloudinary.com/read-cv/video/upload/t_v_b/v1/1/profileItems/W2azTw5BVbMXfj7F53G92hMVIn32/newProfileItem/d898be8a-7037-4c71-af0c-8997239b050d.mp4?_a=DATAdtAAZAA0',
        id: 'project1',
    },
    {
        name: 'Astraea',
        description: 'Powerful yet efficient AI agent optimized for facial recognition and analysis.',
        link: 'https://woodrowrowoldt.com',
        video:
            'https://res.cloudinary.com/read-cv/video/upload/t_v_b/v1/1/profileItems/W2azTw5BVbMXfj7F53G92hMVIn32/XSfIvT7BUWbPRXhrbLed/ee6871c9-8400-49d2-8be9-e32675eabf7e.mp4?_a=DATAdtAAZAA0',
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
    },
    {
        company: 'Freelance',
        title: 'Care Giver',
        start: '2023',
        end: '2024',
        link: 'https://woodrowrowoldt.com',
        id: 'work2',
    },
    {
        company: 'Sagano, Oak Park',
        title: 'Waiter / Server',
        start: '2022',
        end: '2023',
        link: 'https://woodrowrowoldt.com',
        id: 'work3',
    },
]

export const BLOG_POSTS: BlogPost[] = [
    {
        title: '01/01/26',
        description: 'A reflection on 2025.',
        link: '/blog/01-01-26',
        uid: 'blog-1',
    },
    {
        title: '02/01/26',
        description:
            'First time contributing to OSS.',
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

export const EMAIL = 'me@woodrowrowoldt.com'
