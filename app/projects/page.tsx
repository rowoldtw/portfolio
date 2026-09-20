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
    title: 'Project 01',
    category: 'Web design',
    imageSrc: '/projects/placeholder-01.svg',
    imageAlt: 'Placeholder website interface in sage green',
  },
  {
    title: 'Project 02',
    category: 'Motion & interaction',
    imageSrc: '/projects/placeholder-02.svg',
    imageAlt: 'Placeholder website interface in warm neutral colors',
  },
  {
    title: 'Project 03',
    category: 'Digital experience',
    imageSrc: '/projects/placeholder-03.svg',
    imageAlt: 'Placeholder website interface in soft lavender',
  },
]

export default function ProjectsPage() {
  return (
    <main className="bg-background relative isolate flex min-h-dvh items-center px-6 py-28 sm:px-10 dark:bg-[#121212]">
      <section
        className="mx-auto w-full max-w-5xl"
        aria-labelledby="projects-heading"
      >
        <div className="mb-10 sm:px-8">
          <h1 id="projects-heading" className="text-lg font-medium">
            Projects
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            A few things taking shape. Placeholder previews for now.
          </p>
        </div>
        <HoverProjects projects={projects} />
      </section>
    </main>
  )
}
