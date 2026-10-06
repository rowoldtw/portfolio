import type { Metadata } from 'next'
import {
  HoverProjects,
  type ShowcaseProject,
} from '@/components/hover-projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects and experiments by Woodrow Rowoldt.',
}

const projects: ShowcaseProject[] = [
  {
    title: 'Amarula',
    category: 'Agentic DAW',
    href: 'https://amarula.app',
  },
  {
    title: 'Rooibos',
    category: 'LiDAR Appearance Analyzer',
  },
  {
    title: 'Muta',
    category: 'Coming Soon',
  },
]

export default function ProjectsPage() {
  return (
    <main
      aria-label="Projects"
      data-projects-page=""
      className="projects-viewport relative isolate h-dvh px-6 sm:px-10"
    >
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col">
        <HoverProjects projects={projects} />
      </div>
    </main>
  )
}
