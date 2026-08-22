'use client'

import {
  BadgeCheck,
  BriefcaseBusiness,
  FolderKanban,
  HomeIcon,
  Mail,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { SectionNav } from '@/components/section-nav'
import { useHomeSection } from '@/components/home-section-provider'

const HOME_SECTION_EVENT = 'portfolio:home-section-select'

const HOME_SECTIONS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'projects', label: 'Projects / GitHub', icon: FolderKanban },
  { id: 'experience', label: 'Experience', icon: BriefcaseBusiness },
  { id: 'skills', label: 'Skills / Certifications', icon: BadgeCheck },
  { id: 'connect', label: 'Connect', icon: Mail },
] as const

export function PersistentSectionNav() {
  const pathname = usePathname()
  const { activeHomeSectionId, isHomeSectionReady } = useHomeSection()

  if (pathname !== '/') return null

  const sections = [...HOME_SECTIONS]
  const activeId = sections.some(
    (section) => section.id === activeHomeSectionId,
  )
    ? activeHomeSectionId
    : HOME_SECTIONS[0].id

  return (
    <SectionNav
      sections={sections}
      activeId={activeId}
      activeIndicatorReady={isHomeSectionReady}
      onSelect={(id) => {
        window.dispatchEvent(
          new CustomEvent(HOME_SECTION_EVENT, { detail: { id } }),
        )
      }}
    />
  )
}
