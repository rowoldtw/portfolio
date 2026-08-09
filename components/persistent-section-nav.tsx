'use client'

import {
  BadgeCheck,
  BriefcaseBusiness,
  FolderKanban,
  GalleryHorizontal,
  HomeIcon,
  Mail,
  NotebookText,
  UserRound,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { SectionNav } from '@/components/section-nav'
import { useHomeSection } from '@/components/home-section-provider'
import { useUiPreferences } from '@/components/ui-preferences-provider'

const HOME_SECTION_EVENT = 'portfolio:home-section-select'

const HOME_SECTIONS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'projects', label: 'Projects / GitHub', icon: FolderKanban },
  { id: 'experience', label: 'Experience', icon: BriefcaseBusiness },
  { id: 'skills', label: 'Certifications / Skills', icon: BadgeCheck },
  { id: 'connect', label: 'Connect', icon: Mail },
] as const

const PAGE_SECTIONS = {
  gallery: [{ id: 'gallery', label: 'Gallery', icon: GalleryHorizontal }],
  personal: [{ id: 'personal', label: 'Personal', icon: UserRound }],
  blog: [{ id: 'journal', label: 'Journal', icon: NotebookText }],
} as const

function getPageSection(pathname: string) {
  if (pathname.startsWith('/gallery')) return PAGE_SECTIONS.gallery
  if (pathname.startsWith('/personal')) return PAGE_SECTIONS.personal
  if (pathname.startsWith('/blog')) return PAGE_SECTIONS.blog
  return [{ id: 'page', label: 'Page', icon: HomeIcon }]
}

export function PersistentSectionNav() {
  const pathname = usePathname()
  const { activeHomeSectionId, isHomeSectionReady } = useHomeSection()
  const { animationsDisabled } = useUiPreferences()
  const isHome = pathname === '/'
  const sections = isHome ? [...HOME_SECTIONS] : [...getPageSection(pathname)]
  const activeId = isHome
    ? sections.some((section) => section.id === activeHomeSectionId)
      ? activeHomeSectionId
      : HOME_SECTIONS[0].id
    : sections[0].id

  return (
    <SectionNav
      sections={sections}
      activeId={activeId}
      activeIndicatorReady={!isHome || isHomeSectionReady}
      onSelect={(id) => {
        if (isHome) {
          window.dispatchEvent(
            new CustomEvent(HOME_SECTION_EVENT, { detail: { id } }),
          )
          return
        }

        window.scrollTo({
          top: 0,
          behavior: animationsDisabled ? 'auto' : 'smooth',
        })
      }}
    />
  )
}
